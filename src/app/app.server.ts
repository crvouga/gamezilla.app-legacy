import {
  ClientId,
  Cmd,
  ServerWireMsg,
  SessionId,
  Sub,
  andThen,
  p,
} from "src/core";
import { AuthServer } from "src/app/auth";
import { ChatServer } from "src/app/chat";
import { ProfileServer } from "src/app/profile";
import { SearchServer } from "src/app/search";
import { UserId } from "src/shared/app";
import {
  ServerAppMsg,
  ServerCtx,
  ServerReqCtx,
  ServerUnauthenticatedReqCtx,
} from "src/shared/server";
import { SpaceServer } from "src/app/space";
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

type Model = ServerModel;

export const init: { model: Model; cmd?: Cmd<Msg> } = {
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

type Msg = ServerMsg;

export const update = async (input: {
  msg: Msg;
  model: Model;
  ctx: ServerCtx;
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): Promise<{
  model: Model;
  cmd?: Cmd<Msg>;
}> => {
  const updated = await updateMain(input);

  const appMsgs = updated.msgs ?? [];

  const appUpdated = appMsgs.reduce(
    (acc, msg) =>
      p(
        acc,
        andThen((model) => updateFromApp({ ...input, model, msg }))
      ),
    updated
  );

  return appUpdated;
};

const updateMain = async ({
  msg,
  model,
  ctx,
  broadcast,
  sendToClient,
}: {
  msg: Msg;
  model: Model;
  ctx: ServerCtx;
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): Promise<{
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ServerAppMsg[];
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
      broadcast,
      sendToClient,
    });
  }

  if (msg.t === "game-space") {
    const updated = await SpaceServer.update({
      sendToUser: (userIds, m) =>
        sendToUser(sendToClient, model, userIds, { t: "game-space", c: m }),
      msg: msg.c,
      model: model.space,
      ctx,
    });

    return {
      model: { ...model, space: updated.model },
      cmd: Cmd.t("game-space", updated.cmd ?? Cmd.None),
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
  model: Model;
}): {
  model: Model;
  msgs?: ServerAppMsg[];
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
      msgs: [
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

const updateFromApp = ({
  msg,
  model,
  sendToClient,
}: {
  msg: ServerAppMsg;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const spaceUpdated = SpaceServer.updateFromApp({
    msg,
    model: model.space,
    sendToClient: (clientIds, m) =>
      sendToClient(clientIds, { t: "game-space", c: m }),
  });

  const profileUpdated = ProfileServer.updateFromApp({
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
    cmd: Cmd.batch<Msg>([
      Cmd.t("game-space", spaceUpdated.cmd),
      Cmd.t("profile", profileUpdated.cmd),
    ]),
  };
};

const updateFromClient = async ({
  msg,
  model,
  ctx,
  broadcast,
  sendToClient,
}: {
  ctx: ServerUnauthenticatedReqCtx;
  msg: ToServer;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): Promise<{
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ServerAppMsg[];
}> => {
  const currentUserId = model.auth.sessions[ctx.sessionId]?.userId;
  const authReqCtx: ServerReqCtx | null = currentUserId
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
    });
    return {
      model: { ...model, auth: updated.model },
      cmd: Cmd.t("auth", updated.cmd),
      msgs: updated.msgs,
    };
  }

  if (msg.t === "profile") {
    const updated = ProfileServer.updateFromClient({
      model: model.profile,
      msg: msg.c,
      sendToClient: (c) => sendToClient([ctx.clientId], { t: "profile", c }),
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

  if (msg.t === "game-space") {
    if (!authReqCtx) {
      return { model };
    }

    const updated = await SpaceServer.updateFromClient({
      ctx: authReqCtx,
      msg: msg.c,
      model: model.space,
      broadcast: (c) => broadcast({ t: "game-space", c }),
      sendToClient: (c) => sendToClient([ctx.clientId], { t: "game-space", c }),
      sendToUser: (userIds, c) =>
        sendToUser(sendToClient, model, userIds, { t: "game-space", c }),
    });

    return {
      model: {
        ...model,
        space: updated.model,
      },
      cmd: Cmd.t("game-space", updated.cmd ?? Cmd.None),
    };
  }

  return { model };
};

const sendToUser = (
  sendToClient: (clientIds: ClientId[], msg: ToClient) => Cmd,
  model: Model,
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
  model: Model;
  ctx: ServerCtx;
}): Sub<Msg> => {
  return Sub.batch([
    Sub.tag(
      "game-space",
      SpaceServer.subscriptions({ model: model.space, ctx })
    ),
    Sub.tag("wire", onWireMsg),
    p(
      onClientMsg,
      Sub.map(
        ({ sessionId, clientId, msg }): Msg => ({
          t: "▶",
          sessionId,
          clientId,
          c: msg,
        })
      )
    ),
  ]);
};

export const onClientMsg = Sub.create<{
  sessionId: SessionId;
  clientId: ClientId;
  msg: ToServer;
}>();

export const onWireMsg = Sub.create<ServerWireMsg>();
