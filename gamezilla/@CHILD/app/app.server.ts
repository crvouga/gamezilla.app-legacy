import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  AnonymousReqCtx,
  ReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvt,
  sendBack,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Posix, Sub } from "gamezilla/@SHARED/core";
import * as AuthServer from "./@CHILD/auth/auth.server";
import * as ChatServer from "./@CHILD/chat/chat.server";
import * as ProfileServer from "./@CHILD/profile/profile.server";
import * as SearchServer from "./@CHILD/search/search.server";
import * as SpaceServer from "./@CHILD/space/space.server";
import { ClientId, SessionId } from "./@SHARED/data";
import { createDbConnMySql, createDbConnSqlLite } from "./app-server";
import {
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  WireSession,
} from "./app.core";
import { ServerWireMsg } from "./wire";

//
//
//
// Model
//
//
//

export const init: { model: ServerModel; eff?: Eff<ServerMsg> } = {
  model: {
    sessions: {},
    space: SpaceServer.init().model,
    profile: ProfileServer.init,
    search: SearchServer.init.model,
    chat: ChatServer.init.model,
    auth: AuthServer.init,
  },
};

//
//
//
// Update
//
//
//

export const update = async (input: {
  msg: ServerMsg;
  model: ServerModel;
  ctx: ServerCtx;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
}> => {
  const { model, ctx } = input;

  const updated = await updateMain(input);

  let acc = updated;

  let iterations = 0;
  while (count(acc.evt) > 0 && iterations < 100) {
    iterations++;
    for (const e of acc.evt ?? []) {
      const updatedEvt = await updateFromEvent({
        ...input,
        ctx,
        model: acc.model,
        msg: e,
      });
      acc = {
        model: updatedEvt.model,
        eff: Eff.batch([acc.eff, updatedEvt.eff]),
        cmd: [...(acc.cmd ?? []), ...(updatedEvt.cmd ?? [])],
        evt: updatedEvt.evt,
      };
    }
  }

  const eff = cmdToEff(model, acc.cmd ?? []);

  return {
    model: acc.model,
    eff: Eff.batch([eff, acc.eff]),
  };
};

const count = <T>(arr?: T[]): number => {
  return arr?.length ?? 0;
};

const cmdToEff = (
  model: ServerModel,
  cmdList: ServerCmd<ToClient>[]
): Eff<ServerMsg> => {
  const broadcastMsgs: ToClient[] = [];
  const toClientMsgs: {
    [clientId: ClientId]: {
      clientId: ClientId;
      msgs: ToClient[];
    };
  } = {};

  for (const cmd of cmdList) {
    switch (cmd.t) {
      case "broadcast": {
        broadcastMsgs.push(cmd.msg);
        break;
      }
      case "send-to-client": {
        for (const clientId of cmd.clientIds) {
          toClientMsgs[clientId] = {
            clientId,
            msgs: [cmd.msg, ...(toClientMsgs[clientId]?.msgs ?? [])],
          };
        }
        break;
      }
      case "send-to-user": {
        const clientIds: ClientId[] = [];

        const userIdSet = new Set<UserId>(cmd.userIds);

        for (const sessionId in model.sessions) {
          if (!SessionId.is(sessionId)) {
            continue;
          }

          const session = model.sessions[sessionId];

          const authSession = model.auth.sessions[sessionId];

          if (!session) {
            continue;
          }

          if (!authSession) {
            continue;
          }

          if (!userIdSet.has(authSession.userId)) {
            continue;
          }

          if (!session.clientId) {
            continue;
          }

          clientIds.push(session.clientId);
        }

        for (const clientId of clientIds) {
          toClientMsgs[clientId] = {
            clientId,
            msgs: [cmd.msg, ...(toClientMsgs[clientId]?.msgs ?? [])],
          };
        }

        break;
      }
    }
  }

  return () => {
    toClientBroadcast.publish(broadcastMsgs);
    toClient.publish(toClientMsgs);
  };
};

const updateMain = async ({
  msg,
  model,
  ctx,
}: {
  msg: ServerMsg;
  model: ServerModel;
  ctx: ServerCtx;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  evt?: ServerEvt[];
  cmd?: ServerCmd<ToClient>[];
}> => {
  switch (msg.t) {
    case "➡️": {
      return updateFromClient({
        ctx: {
          ...ctx,
          sessionId: msg.sessionId,
          clientId: msg.clientId,
        },
        msg: msg.c,
        model,
      });
    }

    case "wire": {
      return updateWire({ msg: msg.c, model });
    }

    case "space": {
      const updated = await SpaceServer.update({
        msg: msg.c,
        model: model.space,
        ctx,
      });

      return {
        model: { ...model, space: updated.model },
        eff: Eff.t("space", updated.eff ?? Eff.None),
        cmd: ServerCmd.tag("space", updated.cmd),
      };
    }

    case "profile": {
      const updated = ProfileServer.update({
        model: model.profile,
        msg: msg.c,
      });
      return {
        model: { ...model, profile: updated.model },
        cmd: ServerCmd.tag("profile", updated.cmd),
      };
    }

    case "search": {
      const updated = SearchServer.update({
        model: model.search,
        msg: msg.c,
      });
      return {
        model: { ...model, search: updated.model },
        eff: Eff.t("search", updated.eff),
      };
    }

    case "auth": {
      const updated = AuthServer.update({ model: model.auth, msg: msg.c });
      return {
        model: { ...model, auth: updated.model },
        evt: updated.evt,
      };
    }

    case "chat": {
      const updated = ChatServer.update({
        model: model.chat,
        msg: msg.c,
      });

      return {
        model: { ...model, chat: updated.model },
        eff: Eff.t("chat", updated.eff),
      };
    }
  }
};

const updateWire = ({
  msg,
  model,
}: {
  msg: ServerWireMsg;
  model: ServerModel;
}): {
  model: ServerModel;
  evt?: ServerEvt[];
} => {
  switch (msg.t) {
    case "client-connected": {
      const sessionId = msg.sessionId;
      const sessionNew: WireSession = {
        clientId: msg.clientId,
        sessionId,
      };

      return {
        model: {
          ...model,
          sessions: {
            ...model.sessions,
            [sessionNew.sessionId]: sessionNew,
          },
        },
        evt: [
          {
            ...msg,
            userId: model.auth.sessions[msg.sessionId]?.userId,
            t: "client-connected",
          },
        ],
      };
    }

    case "client-disconnected": {
      const sessionNew: WireSession = {
        sessionId: msg.sessionId,
      };
      return {
        model: {
          ...model,
          sessions: {
            ...model.sessions,
            [sessionNew.sessionId]: sessionNew,
          },
        },
      };
    }
  }
};

const updateFromClient = async ({
  msg,
  model,
  ctx,
}: {
  ctx: AnonymousReqCtx;
  msg: ToServer;
  model: ServerModel;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: ServerCmd<ToClient>[];
  evt?: ServerEvt[];
}> => {
  const currentUserId = model.auth.sessions[ctx.sessionId]?.userId;
  const authReqCtx: ReqCtx | null = currentUserId
    ? {
        ...ctx,
        currentUserId,
      }
    : null;
  switch (msg.t) {
    case "auth": {
      const updated = AuthServer.updateFromClient({
        ctx,
        model: model.auth,
        msg: msg.c,
      });
      return {
        model: { ...model, auth: updated.model },
        cmd: ServerCmd.tag("auth", updated.cmd),
        evt: updated.evt,
        eff: Eff.t("auth", updated.eff),
      };
    }

    case "profile": {
      if (!authReqCtx) {
        return { model, cmd: [sendBack(ctx, { t: "access-denied", msg })] };
      }

      const updated = ProfileServer.updateFromClient({
        model: model.profile,
        msg: msg.c,
        ctx: authReqCtx,
      });

      return {
        model: { ...model, profile: updated.model },
        eff: Eff.t("profile", updated.eff),
      };
    }

    case "search": {
      const updated = SearchServer.updateFromClient({
        model: model.search,
        msg: msg.c,
      });
      return {
        model: { ...model, search: updated.model },
        eff: Eff.t("search", updated.eff),
      };
    }

    case "chat": {
      const updated = ChatServer.updateFromClient({
        model: model.chat,
        msg: msg.c,
      });
      return {
        model: { ...model, chat: updated.model },
        eff: Eff.t("chat", updated.eff),
      };
    }

    case "space": {
      if (!authReqCtx) {
        return { model, cmd: [sendBack(ctx, { t: "access-denied", msg })] };
      }

      const updated = await SpaceServer.updateFromClient({
        ctx: authReqCtx,
        msg: msg.c,
        model: model.space,
      });

      return {
        model: {
          ...model,
          space: updated.model,
        },
        eff: Eff.t("space", updated.eff),
        cmd: ServerCmd.tag("space", updated.cmd),
      };
    }
  }
};

const updateFromEvent = async ({
  ctx,
  msg,
  model,
}: {
  ctx: ServerCtx;
  msg: ServerEvt;
  model: ServerModel;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: ServerCmd<ToClient>[];
  evt?: ServerEvt[];
}> => {
  const space = await SpaceServer.updateFromEvent({
    ctx,
    msg,
    model: model.space,
  });

  const profile = ProfileServer.updateFromEvent({
    ctx,
    msg,
    model: model.profile,
  });

  const auth = AuthServer.updateFromEvent({
    msg,
    model: model.auth,
  });

  return {
    model: {
      ...model,
      space: space.model,
      profile: profile.model,
      auth: auth.model,
    },
    eff: Eff.batch<ServerMsg>([
      Eff.t("space", space.eff),
      Eff.t("profile", profile.eff),
    ]),
    cmd: [
      ...(ServerCmd.tag("space", space.cmd) ?? []),
      ...(ServerCmd.tag("auth", auth.cmd) ?? []),
    ],
    evt: [...(auth.evt ?? [])],
  };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = async ({
  model,
  ctx,
}: {
  model: ServerModel;
  ctx: ServerCtx;
}): Promise<Sub<ServerMsg>> => {
  return Sub.batch([
    Sub.tag(
      "space",
      await SpaceServer.subscriptions({ model: model.space, ctx })
    ),
    Sub.tag("wire", wire),
    Sub.flatten(fromClient, ({ sessionId, clientId, msgs }) =>
      msgs.map(
        (msg): ServerMsg => ({
          t: "➡️",
          sessionId,
          clientId,
          c: msg,
        })
      )
    ),
  ]);
};

export const toClient = Sub.create<{
  [clientId: ClientId]: {
    clientId: ClientId;
    msgs: ToClient[];
  };
}>();

export const toClientBroadcast = Sub.create<ToClient[]>();

export const fromClient = Sub.create<{
  sessionId: SessionId;
  clientId: ClientId;
  msgs: ToServer[];
}>();

export const wire = Sub.create<ServerWireMsg>();

//
//
//
//
//
//

export const initCtx = async (): Promise<ServerCtx> => {
  console.log("[server] db connecting...");

  const DATABASE_URL = process.env["DATABASE_URL"];

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  if (DATABASE_URL.includes("sqlite")) {
    const sqlLite = createDbConnSqlLite({
      connectionString: DATABASE_URL.replace("sqlite:", ""),
    });
    console.log("[server] sql lite db connected.");
    return {
      dbConn: sqlLite,
      now: Posix.now(),
    };
  }

  if (DATABASE_URL.includes("mysql")) {
    const mySql = await createDbConnMySql({
      connectionString: DATABASE_URL,
    });
    console.log("[server] my sql db connected.");
    return {
      dbConn: mySql,
      now: Posix.now(),
    };
  }

  throw new Error(`DATABASE_URL not supported. ${DATABASE_URL}`);
};
