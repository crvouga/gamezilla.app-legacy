import {
  ClientId,
  Cmd,
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
  ServerEffect,
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

export const init: { model: ServerModel; cmd?: Cmd<ServerMsg> } = {
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
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): Promise<{
  model: ServerModel;
  cmd?: Cmd<ServerMsg>;
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
        andThen((model) => updateFromParent({ ...input, model, msg }))
      ),
    updated
  );

  //
  //
  //
  //
  //

  const cmdList: Cmd<ServerMsg>[] = [];

  for (const eff of appUpdated.eff ?? []) {
    if (eff.t === "send-to-client") {
      cmdList.push(input.sendToClient(eff.clientIds, eff.msg));
    }
    if (eff.t === "broadcast") {
      cmdList.push(input.broadcast(eff.msg));
    }
    if (eff.t === "send-to-user") {
      cmdList.push(
        sendToUser(input.sendToClient, appUpdated.model, eff.userIds, eff.msg)
      );
    }
  }

  //
  //
  //
  //

  return { ...appUpdated, cmd: Cmd.batch([...cmdList, appUpdated.cmd]) };
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
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): Promise<{
  model: ServerModel;
  cmd?: Cmd<ServerMsg>;
  events?: ServerEvent[];
  eff?: ServerEffect<ToClient>[];
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
      cmd: Cmd.t("space", updated.cmd ?? Cmd.None),
    };
  }

  if (msg.t === "profile") {
    const updated = ProfileServer.update({
      model: model.profile,
      msg: msg.c,
    });
    return {
      model: { ...model, profile: updated.model },
      cmd: Cmd.t("profile", updated.cmd),
    };
  }

  if (msg.t === "search") {
    const updated = SearchServer.update({
      model: model.search,
      msg: msg.c,
    });
    return {
      model: { ...model, search: updated.model },
      cmd: Cmd.t("search", updated.cmd),
    };
  }

  if (msg.t === "auth") {
    const updated = AuthServer.update({
      model: model.auth,
      msg: msg.c,
    });
    return {
      model: { ...model, auth: updated.model },
      cmd: Cmd.t("auth", updated.cmd),
    };
  }

  if (msg.t === "chat") {
    const updated = ChatServer.update({
      model: model.chat,
      msg: msg.c,
    });

    return {
      model: { ...model, chat: updated.model },
      cmd: Cmd.t("chat", updated.cmd),
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

const updateFromParent = ({
  msg,
  model,
  sendToClient,
}: {
  msg: ServerEvent;
  model: ServerModel;
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): {
  model: ServerModel;
  cmd?: Cmd<ServerMsg>;
} => {
  const spaceUpdated = SpaceServer.updateFromParent({
    msg,
    model: model.space,
    sendToClient: (clientIds, m) =>
      sendToClient(clientIds, { t: "space", c: m }),
  });

  const profileUpdated = ProfileServer.updateFromParent({
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
    cmd: Cmd.batch<ServerMsg>([
      Cmd.t("space", spaceUpdated.cmd),
      Cmd.t("profile", profileUpdated.cmd),
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
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): Promise<{
  model: ServerModel;
  cmd?: Cmd<ServerMsg>;
  eff?: ServerEffect<ToClient>[];
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
      cmd: Cmd.t("auth", updated.cmd),
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
      cmd: Cmd.t("profile", updated.cmd),
    };
  }

  if (msg.t === "search") {
    const updated = SearchServer.updateFromClient({
      model: model.search,
      msg: msg.c,
    });
    return {
      model: { ...model, search: updated.model },
      cmd: Cmd.t("search", updated.cmd),
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
      cmd: Cmd.t("chat", updated.cmd),
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
      cmd: Cmd.t("space", updated.cmd),
      eff: ServerEffect.tag("space", updated.eff),
    };
  }

  return { model };
};

const sendToUser = (
  sendToClient: (clientIds: ClientId[], msg: ToClient) => Cmd,
  model: ServerModel,
  userIds: UserId[],
  msg: ToClient
): Cmd => {
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

export const subscriptions = ({
  model,
  ctx,
}: {
  model: ServerModel;
  ctx: ServerCtx;
}): Sub<ServerMsg> => {
  return Sub.batch([
    Sub.tag("space", SpaceServer.subscriptions),
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
