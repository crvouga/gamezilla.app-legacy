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
import { Cmd, exhaustive, p, Program, Sub } from '@gamezilla/core';
import { RoomBackend } from '@gamezilla/room';
import { ClientId, SessionId, UserId } from '@gamezilla/shared';
import { DatabaseConnection } from '@gamezilla/shared/backend';
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
    room: RoomBackend.init,
    sessions: {},
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
  dbConn,
}: {
  msg: Msg;
  model: Model;
  dbConn: DatabaseConnection;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg[0]) {
    case '→': {
      return updateFromFrontend({
        dbConn,
        sessionId: msg[1],
        clientId: msg[2],
        msg: msg[3],
        model,
      });
    }

    case 'room': {
      const updated = RoomBackend.update({
        sendToUser: (userIds, m) => sendToUser(model, userIds, ['room', m]),
        msg: msg[1],
        model: model.room,
      });

      return {
        model: { ...model, room: updated.model },
        cmd: Cmd.tag('room', updated.cmd ?? Cmd.None),
      };
    }

    case 'client-connected': {
      const sessionId = msg[1];
      const clientId = msg[2];

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
      };
    }

    case 'client-disconnected': {
      const sessionId = msg[1];
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

    default: {
      return exhaustive(msg[0]);
    }
  }
};

const updateFromFrontend = ({
  dbConn,
  sessionId,
  clientId,
  msg,
  model,
}: {
  dbConn: DatabaseConnection;
  sessionId: SessionId;
  clientId: ClientId;
  msg: ToBackend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const sendToClient = (m: ToFrontend) => sendToFrontend([clientId], m);

  switch (msg[0]) {
    case 'auth': {
      switch (msg[1][0]) {
        case 'user-logged-in': {
          const userId = msg[1][1];

          const session: Session = {
            sessionId,
            clientId,
            userId,
          };

          return {
            model: {
              ...model,
              sessions: {
                ...model.sessions,
                [sessionId]: session,
              },
            },
          };
        }

        default: {
          return { model };
        }
      }
    }

    case 'room': {
      const session = model.sessions[sessionId];

      if (!session) {
        return { model };
      }

      if (!session.userId) {
        return { model };
      }

      const updated = RoomBackend.updateFromFrontend({
        ctx: {
          currentUserId: session.userId,
          dbConn,
        },
        wire: {
          broadcast: (m) => broadcast(['room', m]),
          sendToClient: (m) => sendToClient(['room', m]),
          sendToUser: (userIds, m) => sendToUser(model, userIds, ['room', m]),
        },
        msg: msg[1],
        model: model.room,
      });

      return {
        model: {
          ...model,
          room: updated.model,
        },
        cmd: Cmd.tag('room', updated.cmd ?? Cmd.None),
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

export const subscriptions = (model: Model): Sub<Msg> => {
  return Sub.batch([
    Sub.tag('room', RoomBackend.subscriptions(model.room)),
    p(
      onConnect,
      Sub.map(
        ([sessionId, clientId]): Msg => [
          'client-connected',
          sessionId,
          clientId,
        ]
      )
    ),
    p(
      onDisconnect,
      Sub.map(
        ([sessionId, clientId]): Msg => [
          'client-disconnected',
          sessionId,
          clientId,
        ]
      )
    ),
    p(
      fromFrontend,
      Sub.map(
        ([sessionId, clientId, msg]): Msg => ['→', sessionId, clientId, msg]
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
  console.log('[backend] connecting to database...');
  const dbConn = DatabaseConnection.create({
    connectionString:
      'postgresql://postgres:JTPtysQIb0RXHj7QKRxm@containers-us-west-105.railway.app:7893/railway',
  });
  console.log('[backend] connected.');

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
        return update({ ...input, dbConn });
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
    const msg = state.msg?.flat(Infinity);
    const msgType = msg?.reduce<string | null>(
      (msgType, subMsgType) =>
        typeof subMsgType === 'string'
          ? msgType
            ? `${msgType}.${subMsgType}`
            : subMsgType
          : msgType,
      null
    );
    if (msgType) {
      console.log(msgType);
    }
  });

  Program.run(program);
};

main();
