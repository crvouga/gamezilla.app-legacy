import {
  BackendModel,
  BackendMsg,
  backendServerPort,
  ClientToServerEvents,
  ServerToClientEvents,
  Session,
  sessionIdKey,
  ToBackend,
  ToFrontend,
} from '@gamezilla/app';
import { AuthBackend } from '@gamezilla/feat/auth';
import { ChatBackend } from '@gamezilla/feat/chat';
import {
  Cmd,
  exhaustive,
  p,
  Program,
  Sub,
  toMsgType,
} from '@gamezilla/shared/core';
import { ProfileBackend } from '@gamezilla/feat/profile';
import { RoomBackend } from '@gamezilla/feat/room';
import { SearchBackend } from '@gamezilla/feat/search';
import { ClientId, SessionId, UserId } from '@gamezilla/shared';
import {
  AppMsg,
  Ctx,
  DatabaseConnectionMySQL,
  RequestCtx,
} from '@gamezilla/shared/backend';
import * as Http from 'http';
import * as Rx from 'rxjs';
import * as Socket from 'socket.io';

//
//
//
// Model
//
//
//

type Model = BackendModel;

export const init: { model: Model; cmd?: Cmd<Msg> } = {
  model: {
    sessions: {},
    room: RoomBackend.init,
    profile: ProfileBackend.init,
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

type Msg = BackendMsg;

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
      return updateFromFrontend({
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
      const updated = ProfileBackend.update({
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
  if (msg.t === 'client-connected') {
    const roomUpdated = RoomBackend.updateFromApp({
      msg,
      model: model.room,
      sendToFrontend: (clientIds, m) =>
        sendToFrontend(clientIds, { t: 'room', c: m }),
    });

    const profileUpdated = ProfileBackend.updateFromApp({
      msg,
      model: model.profile,
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
  }

  return {
    model,
  };
};

const updateFromFrontend = ({
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

      return {
        model: {
          ...model,
          sessions: {
            ...model.sessions,
            [session.sessionId]: session,
          },
        },
      };
    }

    case 'profile': {
      const currentUserId = model.sessions[ctx.sessionId]?.userId;

      if (!currentUserId) {
        return { model, cmd: sendToClient({ t: 'access-denied', msg }) };
      }

      const updated = ProfileBackend.updateFromFrontend({
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
      const updated = SearchBackend.updateFromFrontend({
        model: model.search,
        msg: msg.c,
      });
      return {
        model: { ...model, search: updated.model },
        cmd: Cmd.tag_('search', updated.cmd),
      };
    }

    case 'chat': {
      const updated = ChatBackend.updateFromFrontend({
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

      const updated = RoomBackend.updateFromFrontend({
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

const $sendToFrontend = new Rx.Subject<[ClientId[], ToFrontend]>();
const $broadcast = new Rx.Subject<[ToFrontend]>();

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

//
//
//
// Main
//
//
//

const main = async () => {
  console.log('[backend] planet scale connecting...');

  const DATABASE_URL =
    'mysql://scuu9usphxh6zuxltqbe:pscale_pw_lkZooGgR8H09Uc59IVrcZEt8avVQ54VObBfoFwbCIa3@aws.connect.psdb.cloud/gamezilla?ssl={"rejectUnauthorized":true}';

  const mySql = await DatabaseConnectionMySQL.create({
    connectionString: DATABASE_URL,
  });

  console.log('[backend] planet scale connected.');

  const requestListener: Http.RequestListener = (_request, response) => {
    const state = program.state$.getValue();
    response.end(JSON.stringify({ msgType: state.msg, model: state.model }));
  };

  const httpServer = Http.createServer(requestListener);

  const socketServer = new Socket.Server<
    ClientToServerEvents,
    ServerToClientEvents
  >(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
    cookie: true,
  });

  socketServer.on('connection', (socket) => {
    const maybeSessionId: unknown = socket.handshake.auth[sessionIdKey];

    const sessionId = SessionId.is(maybeSessionId)
      ? maybeSessionId
      : SessionId.generate();

    socket.emit('session-id', sessionId);

    if (ClientId.is(socket.id)) {
      onConnect.next([sessionId, socket.id]);
    }

    socket.on('to-backend', (msg) => {
      if (ClientId.is(socket.id)) {
        fromFrontend.next([sessionId, socket.id, msg]);
      }
    });

    socket.on('disconnect', () => {
      if (ClientId.is(socket.id)) {
        onDisconnect.next([sessionId, socket.id]);
      }
    });
  });

  $broadcast.subscribe(([msg]) => {
    socketServer.emit('to-frontend', msg);
  });

  $sendToFrontend.subscribe(([clientIds, msg]) => {
    socketServer.to(clientIds).emit('to-frontend', msg);
  });

  const port = Number(process.env['PORT']) || backendServerPort;

  httpServer.listen(port, () => {
    console.log(`[backend] http server listening: http://localhost:${port}/`);
  });

  const program = Program.create({
    init,
    subscriptions,
    update: (input) => {
      try {
        return update({
          model: input.model,
          msg: input.msg,
          ctx: {
            mySql,
            now: input.now,
          },
        });
      } catch (error) {
        console.error('Backend Crashed!', error);
        return {
          model: input.model,
          cmd: Cmd.None,
        };
      }
    },
  });

  program.state$.subscribe((state) => {
    if (state.msg) {
      const type = toMsgType(state.msg);
      // const _payload = toMsgType(state.msg);
      console.log(type);
    }
  });

  Program.run(program);
};

main();
