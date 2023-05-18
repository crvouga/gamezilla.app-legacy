import { AuthBackend } from '@gamezilla/feat/auth';
import { ChatBackend } from '@gamezilla/feat/chat';
import { ProfileServer } from '@gamezilla/feat/profile';
import { RoomBackend } from '@gamezilla/feat/room';
import { SearchBackend } from '@gamezilla/feat/search';
import { ClientId, SessionId, UserId } from '@gamezilla/shared/app';
import { AppMsg, Ctx, RequestCtx } from '@gamezilla/shared/backend';
import { Cmd, Sub, exhaustive, p } from '@gamezilla/shared/core';
import * as Rx from 'rxjs';
import {
  ServerModel,
  ServerMsg,
  Session,
  ToBackend,
  ToFrontend,
} from './app.types';

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
    room: RoomBackend.init,
    profile: ProfileServer.init,
    search: SearchBackend.init.model,
    chat: ChatBackend.init.model,
    auth: AuthBackend.init,
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

export const update = ({
  msg,
  model,
  ctx,
}: {
  msg: Msg;
  model: Model;
  ctx: Ctx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
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
      });
    }

    case 'room': {
      const updated = RoomBackend.update({
        sendToUser: (userIds, m) =>
          sendToUser(model, userIds, { t: 'room', c: m }),
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

      const appUpdated = updateFromApp({
        model: modelNew,
        msg: {
          t: 'client-connected',
          sessionId,
          clientId,
          userId: sessionPrev?.userId,
        },
      });

      return { model: appUpdated.model, cmd: appUpdated.cmd };
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
      const updated = SearchBackend.update({
        model: model.search,
        msg: msg.c,
      });
      return {
        model: { ...model, search: updated.model },
        cmd: Cmd.tag_('search', updated.cmd),
      };
    }

    case 'auth': {
      const updated = AuthBackend.update({
        model: model.auth,
        msg: msg.c,
      });
      return {
        model: { ...model, auth: updated.model },
        cmd: Cmd.tag_('auth', updated.cmd),
      };
    }

    case 'chat': {
      const updated = ChatBackend.update({
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
}: {
  msg: AppMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const roomUpdated = RoomBackend.updateFromApp({
    msg,
    model: model.room,
    sendToFrontend: (clientIds, m) =>
      sendToFrontend(clientIds, { t: 'room', c: m }),
  });

  const profileUpdated = ProfileServer.updateFromApp({
    msg,
    model: model.profile,
    sendToFrontend: (clientIds, c) =>
      sendToFrontend(clientIds, { t: 'profile', c }),
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
}: {
  ctx: RequestCtx;
  msg: ToBackend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const sendToClient = (m: ToFrontend) => sendToFrontend([ctx.clientId], m);

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

      const updated = updateFromApp({
        model,
        msg: {
          t: 'client-authenticated',
          clientId: ctx.clientId,
          userId: msg.c.currentUser.currentUserId,
        },
      });

      return {
        model: {
          ...updated.model,
          sessions: {
            ...model.sessions,
            [session.sessionId]: session,
          },
        },
        cmd: updated.cmd,
      };
    }

    case 'profile': {
      const currentUserId = model.sessions[ctx.sessionId]?.userId;

      if (!currentUserId) {
        return { model, cmd: sendToClient({ t: 'access-denied', msg }) };
      }

      const updated = ProfileServer.updateFromClient({
        model: model.profile,
        msg: msg.c,
        sendToClient: (c) => sendToClient({ t: 'profile', c }),
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
      const updated = SearchBackend.updateFromClient({
        model: model.search,
        msg: msg.c,
      });
      return {
        model: { ...model, search: updated.model },
        cmd: Cmd.tag_('search', updated.cmd),
      };
    }

    case 'chat': {
      const updated = ChatBackend.updateFromClient({
        model: model.chat,
        msg: msg.c,
        sendToClient: (c) => sendToClient({ t: 'chat', c }),
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

      const updated = RoomBackend.updateFromClient({
        ctx: {
          ...ctx,
          currentUserId: session.userId,
        },
        wire: {
          broadcast: (c) => broadcast({ t: 'room', c }),
          sendToClient: (c) => sendToClient({ t: 'room', c }),
          sendToUser: (userIds, c) =>
            sendToUser(model, userIds, { t: 'room', c }),
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

const sendToUser = (model: Model, userIds: UserId[], msg: ToFrontend): Cmd => {
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

  return sendToFrontend(clientIds, msg);
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
    Sub.tag_('room', RoomBackend.subscriptions(model.room)),
    p(
      onConnect,
      Sub.map(
        ([sessionId, clientId]): Msg => ({
          t: 'client-connected',
          sessionId,
          clientId,
        })
      )
    ),
    p(
      onDisconnect,
      Sub.map(
        ([sessionId, clientId]): Msg => ({
          t: 'client-disconnected',
          sessionId,
          clientId,
        })
      )
    ),
    p(
      fromFrontend,
      Sub.map(
        ([sessionId, clientId, msg]): Msg => ({
          t: '→',
          sessionId,
          clientId,
          c: msg,
        })
      )
    ),
  ]);
};

//
//
// Wire
//
//

export const fromFrontend = new Rx.Subject<[SessionId, ClientId, ToBackend]>();
export const onConnect = new Rx.Subject<[SessionId, ClientId]>();
export const onDisconnect = new Rx.Subject<[SessionId, ClientId]>();

export const $sendToFrontend = new Rx.Subject<[ClientId[], ToFrontend]>();
export const $broadcast = new Rx.Subject<[ToFrontend]>();

const sendToFrontend =
  (clientIds: ClientId[], msg: ToFrontend): Cmd =>
  () => {
    $sendToFrontend.next([clientIds, msg]);
  };

const broadcast =
  (msg: ToFrontend): Cmd =>
  () => {
    $broadcast.next([msg]);
  };
