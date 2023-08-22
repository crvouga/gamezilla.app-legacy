import {
  ClientId,
  Eff,
  Posix,
  ServerWireMsg,
  SessionId,
  Sub,
  andThen,
  p,
} from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import {
  AnonymousReqCtx,
  ReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvt,
  sendBack,
} from "gamezilla/app/@SHARED/server";
import { AuthServer } from "gamezilla/app/auth";
import { ChatServer } from "gamezilla/app/chat";
import { ProfileServer } from "gamezilla/app/profile";
import { SearchServer } from "gamezilla/app/search";
import { SpaceServer } from "gamezilla/app/space";
import { createDbConnMySql } from "./app-server";
import {
  ServerModel,
  ServerMsg,
  Session,
  ToClient,
  ToServer,
} from "./app.core";

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
    space: SpaceServer.init,
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
  broadcast: (m: ToClient) => Eff;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Eff;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
}> => {
  const { model, broadcast, sendToClient, ctx } = input;

  const updated = await updateMain(input);

  const evt = updated.evt ?? [];

  let acc = updated;

  for (const e of evt) {
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
    };
  }

  const effList = acc.cmd?.map(cmdToEff(model, sendToClient, broadcast)) ?? [];

  return {
    model: acc.model,
    eff: Eff.batch([...effList, acc.eff]),
  };
};

const cmdToEff =
  (
    model: ServerModel,
    sendToClient: (clientIds: ClientId[], m: ToClient) => Eff,
    broadcast: (m: ToClient) => Eff
  ) =>
  (cmd: ServerCmd<ToClient>): Eff<ServerMsg> => {
    switch (cmd.t) {
      case "broadcast": {
        return broadcast(cmd.msg);
      }
      case "send-to-client": {
        return sendToClient(cmd.clientIds, cmd.msg);
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

          clientIds.push(...session.clientIds);
        }

        return sendToClient(clientIds, cmd.msg);
      }
    }
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
    case "▶": {
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
      return { model: { ...model, auth: updated.model } };
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
  events?: ServerEvt[];
} => {
  switch (msg.t) {
    case "client-connected": {
      const sessionId = msg.sessionId;
      const clientIds = model.sessions[sessionId]?.clientIds ?? [];
      const sessionNew: Session = {
        clientIds: [...clientIds, msg.clientId].slice(0, 5),
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
        events: [
          {
            ...msg,
            userId: model.auth.sessions[msg.sessionId]?.userId,
            t: "client-connected",
          },
        ],
      };
    }

    case "client-disconnected": {
      const sessionId = msg.sessionId;
      const clientIds = model.sessions[sessionId]?.clientIds ?? [];
      const sessionNew: Session = {
        clientIds: clientIds.filter((clientId) => clientId !== msg.clientId),
        sessionId,
      };
      return {
        model: {
          ...model,
          sessions: {
            ...model.sessions,
            [sessionId]: sessionNew,
          },
        },
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
}> => {
  const spaceUpdated = await SpaceServer.updateFromEvent({
    ctx,
    msg,
    model: model.space,
  });

  const profileUpdated = ProfileServer.updateFromEvent({
    msg,
    model: model.profile,
  });

  return {
    model: {
      ...model,
      space: spaceUpdated.model,
      profile: profileUpdated.model,
    },
    eff: Eff.batch<ServerMsg>([
      Eff.t("space", spaceUpdated.eff),
      Eff.t("profile", profileUpdated.eff),
    ]),
    cmd: ServerCmd.tag("space", spaceUpdated.cmd),
  };
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
        ...updated,
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
    Sub.tag("wire", onWireMsg),
    Sub.map(
      onClientMsg,
      ({ sessionId, clientId, msg }): ServerMsg => ({
        t: "▶",
        sessionId,
        clientId,
        c: msg,
      })
    ),
  ]);
};

export const onClientMsg = Sub.create<{
  sessionId: SessionId;
  clientId: ClientId;
  msg: ToServer;
}>();

export const onWireMsg = Sub.create<ServerWireMsg>();

//
//
//
//
//
//

export const initCtx = async (): Promise<ServerCtx> => {
  console.log("[server] planet scale connecting...");

  const DATABASE_URL =
    'mysql://scuu9usphxh6zuxltqbe:pscale_pw_lkZooGgR8H09Uc59IVrcZEt8avVQ54VObBfoFwbCIa3@aws.connect.psdb.cloud/gamezilla?ssl={"rejectUnauthorized":true}';

  const mySql = await createDbConnMySql({
    connectionString: DATABASE_URL,
  });

  console.log("[server] planet scale connected.");
  return {
    mySql,
    now: Posix.now(),
  };
};
