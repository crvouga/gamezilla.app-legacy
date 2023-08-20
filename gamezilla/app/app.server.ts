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
import {
  AnonymousReqCtx,
  ReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvent,
} from "gamezilla/app/@SHARED/server";
import { UserId } from "gamezilla/app/@SHARED/data";
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
  const updated = await updateMain(input);

  //
  //
  //
  //
  //

  const appMsgs = updated.events ?? [];

  const appUpdated = appMsgs.reduce(
    (acc, msg) =>
      p(
        acc,
        andThen((model) => updateFromEvent({ ...input, model, msg }))
      ),
    updated
  );

  //
  //
  //
  //
  //

  const effList: Eff<ServerMsg>[] = [];

  for (const cmd of appUpdated.cmd ?? []) {
    if (cmd.t === "send-to-client") {
      effList.push(input.sendToClient(cmd.clientIds, cmd.msg));
    }
    if (cmd.t === "broadcast") {
      effList.push(input.broadcast(cmd.msg));
    }
    if (cmd.t === "send-to-user") {
      effList.push(
        sendToUser(input.sendToClient, appUpdated.model, cmd.userIds, cmd.msg)
      );
    }
  }

  //
  //
  //
  //

  return { ...appUpdated, eff: Eff.batch([...effList, appUpdated.eff]) };
};

const updateMain = async ({
  msg,
  model,
  ctx,
  sendToClient,
}: {
  msg: ServerMsg;
  model: ServerModel;
  ctx: ServerCtx;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Eff;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  events?: ServerEvent[];
  cmd?: ServerCmd<ToClient>[];
}> => {
  if (msg.t === "wire") {
    return updateWire({ msg: msg.c, model });
  }

  if (msg.t === "▶") {
    return updateFromClient({
      ctx: {
        ...ctx,
        sessionId: msg.sessionId,
        clientId: msg.clientId,
      },
      msg: msg.c,
      model,

      sendToClient,
    });
  }

  if (msg.t === "space") {
    const updated = await SpaceServer.update({
      sendToUser: (userIds, m) =>
        sendToUser(sendToClient, model, userIds, { t: "space", c: m }),
      msg: msg.c,
      model: model.space,
      ctx,
    });

    return {
      model: { ...model, space: updated.model },
      eff: Eff.t("space", updated.eff ?? Eff.None),
    };
  }

  if (msg.t === "profile") {
    const updated = ProfileServer.update({
      model: model.profile,
      msg: msg.c,
    });
    return {
      model: { ...model, profile: updated.model },
      eff: Eff.t("profile", updated.eff),
    };
  }

  if (msg.t === "search") {
    const updated = SearchServer.update({
      model: model.search,
      msg: msg.c,
    });
    return {
      model: { ...model, search: updated.model },
      eff: Eff.t("search", updated.eff),
    };
  }

  if (msg.t === "auth") {
    const updated = AuthServer.update({
      model: model.auth,
      msg: msg.c,
    });
    return {
      model: { ...model, auth: updated.model },
      eff: Eff.t("auth", updated.eff),
    };
  }

  if (msg.t === "chat") {
    const updated = ChatServer.update({
      model: model.chat,
      msg: msg.c,
    });

    return {
      model: { ...model, chat: updated.model },
      eff: Eff.t("chat", updated.eff),
    };
  }

  return { model };
};

const updateWire = ({
  msg,
  model,
}: {
  msg: ServerWireMsg;
  model: ServerModel;
}): {
  model: ServerModel;
  events?: ServerEvent[];
} => {
  if (msg.t === "client-connected") {
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

  if (msg.t === "client-disconnected") {
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
  return { model };
};

const updateFromEvent = ({
  msg,
  model,
  sendToClient,
}: {
  msg: ServerEvent;
  model: ServerModel;
  broadcast: (m: ToClient) => Eff;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Eff;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
} => {
  const spaceUpdated = SpaceServer.updateFromEvent({
    msg,
    model: model.space,
    sendToClient: (clientIds, m) =>
      sendToClient(clientIds, { t: "space", c: m }),
  });

  const profileUpdated = ProfileServer.updateFromEvent({
    msg,
    model: model.profile,
    sendToClient: (clientIds, c) =>
      sendToClient(clientIds, { t: "profile", c }),
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
  };
};

const updateFromClient = async ({
  msg,
  model,
  ctx,
  sendToClient,
}: {
  ctx: AnonymousReqCtx;
  msg: ToServer;
  model: ServerModel;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Eff;
}): Promise<{
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: ServerCmd<ToClient>[];
}> => {
  const currentUserId = model.auth.sessions[ctx.sessionId]?.userId;
  const authReqCtx: ReqCtx | null = currentUserId
    ? {
        ...ctx,
        currentUserId,
      }
    : null;

  if (msg.t === "auth") {
    const updated = AuthServer.updateFromClient({
      ctx,
      model: model.auth,
      msg: msg.c,
      sendBack: (c) => sendToClient([ctx.clientId], { t: "auth", c }),
    });
    return {
      model: { ...model, auth: updated.model },
      eff: Eff.t("auth", updated.eff),
    };
  }

  if (msg.t === "profile") {
    const updated = ProfileServer.updateFromClient({
      model: model.profile,
      msg: msg.c,
      sendBack: (c) => sendToClient([ctx.clientId], { t: "profile", c }),
      ctx: authReqCtx,
    });
    return {
      model: { ...model, profile: updated.model },
      eff: Eff.t("profile", updated.eff),
    };
  }

  if (msg.t === "search") {
    const updated = SearchServer.updateFromClient({
      model: model.search,
      msg: msg.c,
    });
    return {
      model: { ...model, search: updated.model },
      eff: Eff.t("search", updated.eff),
    };
  }

  if (msg.t === "chat") {
    const updated = ChatServer.updateFromClient({
      model: model.chat,
      msg: msg.c,
      sendToClient: (c) => sendToClient([ctx.clientId], { t: "chat", c }),
    });
    return {
      model: { ...model, chat: updated.model },
      eff: Eff.t("chat", updated.eff),
    };
  }

  if (msg.t === "space") {
    if (!authReqCtx) {
      return { model };
    }

    const updated = await SpaceServer.updateFromClient({
      ctx: authReqCtx,
      msg: msg.c,
      model: model.space,
      sendToClient: (c) => sendToClient([ctx.clientId], { t: "space", c }),
      sendToUser: (userIds, c) =>
        sendToUser(sendToClient, model, userIds, { t: "space", c }),
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

  return { model };
};

const sendToUser = (
  sendToClient: (clientIds: ClientId[], msg: ToClient) => Eff,
  model: ServerModel,
  userIds: UserId[],
  msg: ToClient
): Eff => {
  const clientIds: ClientId[] = [];

  const userIdSet = new Set<UserId>(userIds);

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

  return sendToClient(clientIds, msg);
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
