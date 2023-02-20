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
import { Cmd, exhaustive, Option, p, Program, Sub } from '@gamezilla/core';
import { ClientId, SessionId, UserId } from '@gamezilla/shared';
import { PartyBackend as Party } from '@gamezilla/party';
import { RoomBackend as GameRoom } from '@gamezilla/room';
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

export const init = (): [Model, Cmd<Msg>] => {
  return [
    {
      gameRoom: GameRoom.init,
      party: Party.init,
      sessions: {},
    },
    Cmd.None,
  ];
};

//
//
//
// Update
//
//
//

type Msg = BackendMsg;

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case '→':
      return updateFromFrontend(msg[1], msg[2], msg[3], model);

    case 'client-connected': {
      const sessionId = msg[1];
      const clientId = msg[2];
      const sessionPrev = model.sessions[sessionId];
      const maybeUserId = sessionPrev ? sessionPrev.userId : Option.None;
      const session: Session = {
        sessionId,
        clientId: Option.Some(clientId),
        userId: maybeUserId,
      };

      const modelNew: Model = {
        ...model,
        sessions: {
          ...model.sessions,
          [sessionId]: session,
        },
      };

      const gameRoomCmd = GameRoom.onClientConnected(
        {
          sendToClient: (msg) => sendToFrontend([clientId], ['room', msg]),
        },
        model.gameRoom
      );

      return [modelNew, Cmd.batch<Msg>([Cmd.tag('room', gameRoomCmd)])];
    }

    case 'client-disconnected': {
      const sessionId = msg[1];
      const sessionPrev = model.sessions[sessionId];
      const maybeUserId = sessionPrev ? sessionPrev.userId : Option.None;
      const sessionNew: Session = {
        clientId: Option.None,
        sessionId,
        userId: maybeUserId,
      };
      return [
        {
          ...model,
          sessions: {
            ...model.sessions,
            [sessionId]: sessionNew,
          },
        },
        Cmd.None,
      ];
    }

    case 'party': {
      const [child, childCmd] = Party.update(
        {
          broadcast: (msg) => broadcast(['party', msg]),
          sendToUser: (userId, msg) =>
            sendToUser(model, userId, ['party', msg]),
        },
        msg[1],
        model.party
      );

      return [{ ...model, party: child }, Cmd.tag('party', childCmd)];
    }

    case 'room': {
      const [child, childCmd] = GameRoom.update(
        {
          sendToUser: (userIds, msg) =>
            sendToUser(model, userIds, ['room', msg]),
        },
        msg[1],
        model.gameRoom
      );

      return [{ ...model, gameRoom: child }, Cmd.tag('room', childCmd)];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

const updateFromFrontend = (
  sessionId: SessionId,
  clientId: ClientId,
  msg: ToBackend,
  model: Model
): [Model, Cmd<Msg>] => {
  const sendToClient = (msg: ToFrontend) => sendToFrontend([clientId], msg);

  switch (msg[0]) {
    case 'auth': {
      switch (msg[1][0]) {
        case 'user-logged-in': {
          const userId = msg[1][1];

          const session: Session = {
            sessionId,
            clientId: Option.Some(clientId),
            userId: Option.Some(userId),
          };

          return [
            {
              ...model,
              sessions: {
                ...model.sessions,
                [sessionId]: session,
              },
            },
            Cmd.None,
          ];
        }

        default: {
          return [model, Cmd.None];
        }
      }
    }

    case 'party': {
      const [child, childCmd] = Party.updateFromFrontend(
        {
          sendToClient: (msg) => sendToFrontend([clientId], ['party', msg]),
          broadcast: (msg) => broadcast(['party', msg]),
          sendToUser: (userIds, msg) =>
            sendToUser(model, userIds, ['party', msg]),
        },
        msg[1],
        model.party
      );

      return [{ ...model, party: child }, Cmd.tag('party', childCmd)];
    }

    case 'room': {
      const session = model.sessions[sessionId];

      if (!session) {
        // TODO: error feedback
        return [model, Cmd.None];
      }

      if (session.userId.type === 'none') {
        // TODO: error feedback
        return [model, Cmd.None];
      }

      const [child, childCmd] = GameRoom.updateFromFrontend(
        { currentUserId: session.userId.value },
        {
          broadcast: (msg) => broadcast(['room', msg]),
          sendToClient: (msg) => sendToClient(['room', msg]),
          sendToUser: (userIds, msg) =>
            sendToUser(model, userIds, ['room', msg]),
        },
        msg[1],
        model.gameRoom
      );

      return [{ ...model, gameRoom: child }, Cmd.tag('room', childCmd)];
    }
  }
};

const sendToUser = (model: Model, userIds: UserId[], msg: ToFrontend) => {
  const clientIds: ClientId[] = [];

  const userIdSet = new Set<UserId>(userIds);

  for (const sessionId in model.sessions) {
    if (!SessionId.is(sessionId)) {
      continue;
    }

    const session = model.sessions[sessionId];

    if (
      session &&
      session.userId.type !== 'none' &&
      session.clientId.type !== 'none' &&
      userIdSet.has(session.userId.value)
    ) {
      clientIds.push(session.clientId.value);
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
    Sub.tag('room', GameRoom.subscriptions(model.gameRoom)),
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

export const fromFrontend = new Rx.Subject<[SessionId, ClientId, ToBackend]>();
export const onConnect = new Rx.Subject<[SessionId, ClientId]>();
export const onDisconnect = new Rx.Subject<[SessionId, ClientId]>();

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

  socket.on('disconnect', () => {
    if (ClientId.is(socket.id)) {
      onDisconnect.next([sessionId, socket.id]);
    }
  });

  socket.on('to-backend', (msg) => {
    if (ClientId.is(socket.id)) {
      fromFrontend.next([sessionId, socket.id, msg]);
    }
  });
});

const sendToFrontend =
  (clientIds: ClientId[], msg: ToFrontend): Cmd =>
  () => {
    socketServer.to(clientIds).emit('to-frontend', msg);
  };

const broadcast =
  (msg: ToFrontend): Cmd =>
  () => {
    socketServer.emit('to-frontend', msg);
  };

const port = Number(process.env['PORT']) || backendServerPort;

httpServer.listen(port, () => {
  console.log(`[backend] http server listening: http://localhost:${port}/`);
});

//
//
//
// Main
//
//
//

const program = Program.create({
  init: init(),
  subscriptions,
  update,
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
