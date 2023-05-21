import { AuthServer } from '@gamezilla/feat/auth';
import { ChatServer } from '@gamezilla/feat/chat';
import { ProfileServer } from '@gamezilla/feat/profile';
import { RoomServer } from '@gamezilla/feat/room';
import { SearchServer } from '@gamezilla/feat/search';
import { ClientId, SessionId, UserId } from '@gamezilla/shared/app';
import { Cmd, Sub, exhaustive, p } from '@gamezilla/shared/core';
import { AppMsg, Ctx, RequestCtx } from '@gamezilla/shared/server';
import { Subject } from 'rxjs';
import {
  ServerModel,
  ServerMsg,
  Session,
  ToClient,
  ToServer,
} from './app.shared';

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
    room: RoomServer.init,
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
  ctx: Ctx;
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const updated = update_(input);

  const appUpdated = (updated.msgs ?? []).reduce<{
    model: Model;
    cmd?: Cmd<Msg>;
  }>((acc, msg) => {
    const appUpdated = updateFromApp({
      ...input,
      msg: msg,
      model: acc.model,
    });
    return {
      model: appUpdated.model,
      cmd: Cmd.batch<Msg>([acc.cmd ?? Cmd.None, appUpdated.cmd ?? Cmd.None]),
    };
  }, updated);

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
  ctx: Ctx;
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: AppMsg[];
} => {
  switch (msg.t) {
    case '→': {
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

    case 'room': {
      const updated = RoomServer.update({
        sendToUser: (userIds, m) =>
          sendToUser(sendToClient, model, userIds, { t: 'room', c: m }),
        msg: msg.c,
        model: model.room,
        ctx,
      });

      return {
        model: { ...model, room: updated.model },
        cmd: Cmd.tag_('room', updated.cmd ?? Cmd.None),
      };
    }

    case 'client-connected': {
      const sessionId = msg.sessionId;
      const clientId = msg.clientId;
      const sessionPrev = model.sessions[sessionId];
      const sessionNew: Session = {
        sessionId,
        clientId: clientId,
        userId: sessionPrev?.userId,
      };
      const modelNew: Model = {
        ...model,
        sessions: {
          ...model.sessions,
          [sessionId]: sessionNew,
        },
      };

      return {
        model: modelNew,
        msgs: [
          {
            t: 'client-connected',
            sessionId,
            clientId,
            userId: sessionPrev?.userId,
          },
        ],
      };
    }

    case 'client-disconnected': {
      const sessionId = msg.sessionId;
      const sessionPrev = model.sessions[sessionId];
      const sessionNew: Session = {
        clientId: undefined,
        sessionId,
        userId: sessionPrev?.userId,
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

    case 'profile': {
      const updated = ProfileServer.update({
        model: model.profile,
        msg: msg.c,
      });
      return {
        model: { ...model, profile: updated.model },
        cmd: Cmd.tag_('profile', updated.cmd),
      };
    }

    case 'search': {
      const updated = SearchServer.update({
        model: model.search,
        msg: msg.c,
      });
      return {
        model: { ...model, search: updated.model },
        cmd: Cmd.tag_('search', updated.cmd),
      };
    }

    case 'auth': {
      const updated = AuthServer.update({
        model: model.auth,
        msg: msg.c,
      });
      return {
        model: { ...model, auth: updated.model },
        cmd: Cmd.tag_('auth', updated.cmd),
      };
    }

    case 'chat': {
      const updated = ChatServer.update({
        model: model.chat,
        msg: msg.c,
      });

      return {
        model: { ...model, chat: updated.model },
        cmd: Cmd.tag_('chat', updated.cmd),
      };
    }

    default: {
      return exhaustive(msg);
    }
  }
};

const updateFromApp = ({
  msg,
  model,
  sendToClient,
}: {
  msg: AppMsg;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const roomUpdated = RoomServer.updateFromApp({
    msg,
    model: model.room,
    sendToClient: (clientIds, m) =>
      sendToClient(clientIds, { t: 'room', c: m }),
  });

  const profileUpdated = ProfileServer.updateFromApp({
    msg,
    model: model.profile,
    sendToClient: (clientIds, c) =>
      sendToClient(clientIds, { t: 'profile', c }),
  });

  return {
    model: {
      ...model,
      room: roomUpdated.model,
      profile: profileUpdated.model,
    },
    cmd: Cmd.batch<Msg>([
      Cmd.tag_('room', roomUpdated.cmd),
      Cmd.tag_('profile', profileUpdated.cmd),
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
  ctx: RequestCtx;
  msg: ToServer;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (clientIds: ClientId[], m: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: AppMsg[];
} => {
  switch (msg.t) {
    case 'auth': {
      if (msg.c.t !== 'got-current-user') {
        return { model };
      }

      if (msg.c.currentUser.t !== 'logged-in') {
        return { model };
      }

      const userId = msg.c.currentUser.currentUserId;

      const session: Session = {
        sessionId: ctx.sessionId,
        clientId: ctx.clientId,
        userId,
      };

      return {
        model: {
          ...model,
          sessions: {
            ...model.sessions,
            [session.sessionId]: session,
          },
        },
        msgs: [
          {
            t: 'client-authenticated',
            clientId: ctx.clientId,
            userId: msg.c.currentUser.currentUserId,
          },
        ],
      };
    }

    case 'profile': {
      const currentUserId = model.sessions[ctx.sessionId]?.userId;

      if (!currentUserId) {
        return {
          model,
          cmd: sendToClient([ctx.clientId], { t: 'access-denied', msg }),
        };
      }

      const updated = ProfileServer.updateFromClient({
        model: model.profile,
        msg: msg.c,
        sendToClient: (c) => sendToClient([ctx.clientId], { t: 'profile', c }),
        ctx: {
          ...ctx,
          currentUserId,
        },
      });
      return {
        model: { ...model, profile: updated.model },
        cmd: Cmd.tag_('profile', updated.cmd),
      };
    }

    case 'search': {
      const updated = SearchServer.updateFromClient({
        model: model.search,
        msg: msg.c,
      });
      return {
        model: { ...model, search: updated.model },
        cmd: Cmd.tag_('search', updated.cmd),
      };
    }

    case 'chat': {
      const updated = ChatServer.updateFromClient({
        model: model.chat,
        msg: msg.c,
        sendToClient: (c) => sendToClient([ctx.clientId], { t: 'chat', c }),
      });
      return {
        model: { ...model, chat: updated.model },
        cmd: Cmd.tag_('chat', updated.cmd),
      };
    }

    case 'room': {
      const session = model.sessions[ctx.sessionId];

      if (!session) {
        return { model };
      }

      if (!session.userId) {
        return { model };
      }

      const updated = RoomServer.updateFromClient({
        ctx: {
          ...ctx,
          currentUserId: session.userId,
        },
        wire: {
          broadcast: (c) => broadcast({ t: 'room', c }),
          sendToClient: (c) => sendToClient([ctx.clientId], { t: 'room', c }),
          sendToUser: (userIds, c) =>
            sendToUser(sendToClient, model, userIds, { t: 'room', c }),
        },
        msg: msg.c,
        model: model.room,
      });

      return {
        model: {
          ...model,
          room: updated.model,
        },
        cmd: Cmd.tag_('room', updated.cmd ?? Cmd.None),
      };
    }
  }
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

    if (
      session &&
      session.userId &&
      session.clientId &&
      userIdSet.has(session.userId)
    ) {
      clientIds.push(session.clientId);
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
    Sub.tag_('room', RoomServer.subscriptions(model.room)),
    p(
      onConnect,
      Sub.map(
        ({ sessionId, clientId }): Msg => ({
          t: 'client-connected',
          sessionId,
          clientId,
        })
      )
    ),
    p(
      onDisconnect,
      Sub.map(
        ({ sessionId, clientId }): Msg => ({
          t: 'client-disconnected',
          sessionId,
          clientId,
        })
      )
    ),
    p(
      fromClientMsgs,
      Sub.map(
        ({ sessionId, clientId, msg }): Msg => ({
          t: '→',
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
