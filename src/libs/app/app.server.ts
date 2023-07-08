import { AuthServer } from "@gamezilla/feat/auth";
import { ChatServer } from "@gamezilla/feat/chat";
import { ProfileServer } from "@gamezilla/feat/profile";
import { SearchServer } from "@gamezilla/feat/search";
import { SpaceServer } from "@gamezilla/feat/space";
import { ClientId, SessionId, UserId } from "@gamezilla/shared/app";
import { Cmd, Sub, andThen, p } from "@gamezilla/shared/core";
import {
  AuthReqServerCtx,
  ReqServerCtx,
  ServerAppMsg,
  ServerCtx,
} from "@gamezilla/shared/server";
import { Subject } from "rxjs";
import {
  ServerModel,
  ServerMsg,
  Session,
  ToClient,
  ToServer,
} from "./app.shared";

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

export const update = (input: {
  msg: Msg;
  model: Model;
  ctx: ServerCtx;
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const updated = update_(input);

  const appMsgs = updated.msgs ?? [];

  const appUpdated = appMsgs.reduce(
    (acc, msg) =>
      p(
        acc,
        andThen(({ model }) => updateFromApp({ ...input, model, msg }))
      ),
    updated
  );

  return appUpdated;
};

const update_ = ({
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
}): {
  model: Model;
  cmd?: Cmd<Msg>;
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
        sessions: sessionNew,
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

  if (msg.t === "→") {
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

  if (msg.t === "space") {
    const updated = SpaceServer.update({
      sendToUser: (userIds, m) =>
        sendToUser(sendToClient, model, userIds, { t: "space", c: m }),
      msg: msg.c,
      model: model.space,
      ctx,
    });

    return {
      model: { ...model, space: updated.model },
      cmd: Cmd.tag_("space", updated.cmd ?? Cmd.None),
    };
  }

  if (msg.t === "profile") {
    const updated = ProfileServer.update({
      model: model.profile,
      msg: msg.c,
    });
    return {
      model: { ...model, profile: updated.model },
      cmd: Cmd.tag_("profile", updated.cmd),
    };
  }

  if (msg.t === "search") {
    const updated = SearchServer.update({
      model: model.search,
      msg: msg.c,
    });
    return {
      model: { ...model, search: updated.model },
      cmd: Cmd.tag_("search", updated.cmd),
    };
  }

  if (msg.t === "auth") {
    const updated = AuthServer.update({
      model: model.auth,
      msg: msg.c,
    });
    return {
      model: { ...model, auth: updated.model },
      cmd: Cmd.tag_("auth", updated.cmd),
    };
  }

  if (msg.t === "chat") {
    const updated = ChatServer.update({
      model: model.chat,
      msg: msg.c,
    });

    return {
      model: { ...model, chat: updated.model },
      cmd: Cmd.tag_("chat", updated.cmd),
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
      sendToClient(clientIds, { t: "space", c: m }),
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
      Cmd.tag_("space", spaceUpdated.cmd),
      Cmd.tag_("profile", profileUpdated.cmd),
    ]),
  };
};

const updateFromClient = ({
  msg,
  model,
  ctx,
  broadcast,
  sendToClient,
}: {
  ctx: ReqServerCtx;
  msg: ToServer;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ServerAppMsg[];
} => {
  const currentUserId = model.auth.sessions[ctx.sessionId]?.userId;
  const authReqCtx: AuthReqServerCtx | null = currentUserId
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
      cmd: Cmd.tag_("auth", updated.cmd),
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
      cmd: Cmd.tag_("profile", updated.cmd),
    };
  }

  if (msg.t === "search") {
    const updated = SearchServer.updateFromClient({
      model: model.search,
      msg: msg.c,
    });
    return {
      model: { ...model, search: updated.model },
      cmd: Cmd.tag_("search", updated.cmd),
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
      cmd: Cmd.tag_("chat", updated.cmd),
    };
  }

  if (msg.t === "space") {
    const updated = SpaceServer.updateFromClient({
      ctx: authReqCtx,
      msg: msg.c,
      model: model.space,
      broadcast: (c) => broadcast({ t: "space", c }),
      sendToClient: (c) => sendToClient([ctx.clientId], { t: "space", c }),
      sendToUser: (userIds, c) =>
        sendToUser(sendToClient, model, userIds, { t: "space", c }),
    });

    return {
      model: {
        ...model,
        space: updated.model,
      },
      cmd: Cmd.tag_("space", updated.cmd ?? Cmd.None),
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

    if (session && authSession && userIdSet.has(authSession.userId)) {
      clientIds.push(...session.clientIds);
    }
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

export const subscriptions = ({ model }: { model: Model }): Sub<Msg> => {
  return Sub.batch([
    Sub.tag_("space", SpaceServer.subscriptions(model.space)),
    p(
      onConnect,
      Sub.map(
        ({ sessionId, clientId }): Msg => ({
          t: "client-connected",
          sessionId,
          clientId,
        })
      )
    ),
    p(
      onDisconnect,
      Sub.map(
        ({ sessionId, clientId }): Msg => ({
          t: "client-disconnected",
          sessionId,
          clientId,
        })
      )
    ),
    p(
      fromClientMsgs,
      Sub.map(
        ({ sessionId, clientId, msg }): Msg => ({
          t: "→",
          sessionId,
          clientId,
          c: msg,
        })
      )
    ),
  ]);
};

export const fromClientMsgs = new Subject<{
  sessionId: SessionId;
  clientId: ClientId;
  msg: ToServer;
}>();

export const onConnect = new Subject<{
  sessionId: SessionId;
  clientId: ClientId;
}>();

export const onDisconnect = new Subject<{
  sessionId: SessionId;
  clientId: ClientId;
}>();
