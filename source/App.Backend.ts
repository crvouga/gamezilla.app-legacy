import * as Rx from "rxjs"
import * as Http from "http"
import * as Socket from "socket.io"
import {
  BackendModel,
  BackendMsg, backendServerPort, ClientToServerEvents,
  ServerToClientEvents,
  Session,
  sessionIdKey,
  ToBackend,
  ToFrontend
} from "./App.Types"
import {
  Cmd,
  exhaustive,
  Option,
  p,
  Platform,
  Sub,
  t
} from "./Core"
import { formatMsg } from "./Core/Debug"
import { ClientId, SessionId, UserId } from "./Data"
import * as GameRoom from "./Game/GameRoom.Backend"
import * as Party from "./Party/Party.Backend"

//
//
//
// Model
//
//
//

type Model = BackendModel

const init = (): [Model, Cmd<Msg>] => {
  return [
    {
      gameRoom: GameRoom.init,
      party: Party.init,
      sessions: {},
    },
    Cmd.None,
  ]
}

//
//
//
// Update
//
//
//

type Msg = BackendMsg

const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "▶":
      return updateFromFrontend(msg[1], msg[2], msg[3], model)

    case "ClientConnected": {
      const sessionId = msg[1]
      const clientId = msg[2]
      const sessionPrev = model.sessions[sessionId]
      const maybeUserId = sessionPrev ? sessionPrev.userId : Option.None
      const session: Session = {
        sessionId,
        clientId: Option.Some(clientId),
        userId: maybeUserId,
      }

      const modelNew: Model = {
        ...model,
        sessions: {
          ...model.sessions,
          [sessionId]: session,
        },
      }



      const gameRoomCmd = GameRoom.onClientConnected(
        {
          sendToClient: (msg) =>
            sendToFrontend([clientId], ["GameRoom", msg]),
        },
        model.gameRoom,
      )

      return [
        modelNew,
        Cmd.batch<Msg>([
          Cmd.tag("GameRoom", gameRoomCmd),
        ]),
      ]
    }

    case "ClientDisconnected": {
      const sessionId = msg[1]
      const sessionPrev = model.sessions[sessionId]
      const maybeUserId = sessionPrev ? sessionPrev.userId : Option.None
      const sessionNew: Session = {
        clientId: Option.None,
        sessionId,
        userId: maybeUserId,
      }
      return [
        {
          ...model,
          sessions: {
            ...model.sessions,
            [sessionId]: sessionNew,
          },
        },
        Cmd.None,
      ]
    }

    case "Party": {
      const [child, childCmd] = Party.update(
        {
          broadcast: (msg) => broadcast(["Party", msg]),
          sendToUser: (userId, msg) =>
            sendToUser(model, userId, ["Party", msg]),
        },
        msg[1],
        model.party,
      )

      return [{ ...model, party: child }, Cmd.tag("Party", childCmd)]
    }

    case "GameRoom": {
      const [child, childCmd] = GameRoom.update(
        {
          sendToUser: (userIds, msg) =>
            sendToUser(model, userIds, ["GameRoom", msg]),
        },
        msg[1],
        model.gameRoom,
      )

      return [{ ...model, gameRoom: child }, Cmd.tag("GameRoom", childCmd)]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

const updateFromFrontend = (
  sessionId: SessionId,
  clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd<Msg>] => {
  const sendToClient = (msg: ToFrontend) => sendToFrontend([clientId], msg)

  switch (msg[0]) {
    case "Auth": {
      switch (msg[1][0]) {
        case "UserLoggedIn": {
          const userId = msg[1][1]

          const session: Session = {
            sessionId,
            clientId: Option.Some(clientId),
            userId: Option.Some(userId),
          }

          return [
            {
              ...model,
              sessions: {
                ...model.sessions,
                [sessionId]: session,
              },
            },
            Cmd.None,
          ]
        }
      }
    }

    case "Party": {
      const [child, childCmd] = Party.updateFromFrontend(
        {
          sendToClient: msg => sendToFrontend([clientId], ['Party', msg]),
          broadcast: (msg) => broadcast(["Party", msg]),
          sendToUser: (userIds, msg) =>
            sendToUser(model, userIds, ["Party", msg]),
        },
        msg[1],
        model.party,
      )

      return [{ ...model, party: child }, Cmd.tag("Party", childCmd)]
    }

    case "GameRoom": {
      const [child, childCmd] = GameRoom.updateFromFrontend(
        {
          broadcast: (msg) => broadcast(["GameRoom", msg]),
          sendToClient: (msg) => sendToClient(["GameRoom", msg]),
          sendToUser: (userIds, msg) =>
            sendToUser(model, userIds, ["GameRoom", msg]),
        },
        msg[1],
        model.gameRoom,
      )

      return [{ ...model, gameRoom: child }, Cmd.tag("GameRoom", childCmd)]
    }

  }
}

const sendToUser = (
  model: Model,
  userIds: UserId[],
  msg: ToFrontend,
) => {
  const clientIds: ClientId[] = []

  const userIdSet = new Set<UserId>(userIds)

  for (const sessionId in model.sessions) {
    if (!SessionId.is(sessionId)) {
      continue
    }

    const session = model.sessions[sessionId]

    if (
      session
      && session.userId.type !== 'None'
      && session.clientId.type !== 'None'
      && userIdSet.has(session.userId.value)
    ) {
      clientIds.push(session.clientId.value)
    }
  }


  return sendToFrontend(clientIds, msg)
}

//
//
//
// Subscriptions
//
//
//

const subscriptions = (model: Model): Sub<Msg> => {
  return Sub.batch([
    p(GameRoom.subscriptions(model.gameRoom), Sub.map(t("GameRoom"))),
    p(onConnect, Sub.map(([sessionId, clientId]): Msg => [
      "ClientConnected",
      sessionId,
      clientId,
    ])),
    p(onDisconnect, Sub.map(([sessionId, clientId]): Msg => [
      "ClientDisconnected",
      sessionId,
      clientId,
    ])),
    p(fromFrontend, Sub.map(([sessionId, clientId, msg]): Msg => [
      "▶",
      sessionId,
      clientId,
      msg,
    ])),
  ])
}

//
//
//
// Server
//
//
//

const requestListener: Http.RequestListener = (_request, response) => {
  const state = program.state$.getValue()
  const msgType = formatMsg(state.msg)
  response.end(JSON.stringify({ msgType: msgType, model: state.model }))
}

const httpServer = Http.createServer(requestListener)

const socketServer = new Socket.Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  {}
>(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
  cookie: true,
})

export const fromFrontend = new Rx.Subject<
  [SessionId, ClientId, ToBackend]
>()
export const onConnect = new Rx.Subject<
  [SessionId, ClientId]
>()
export const onDisconnect = new Rx.Subject<
  [SessionId, ClientId]
>()

socketServer.on("connection", (socket) => {
  const maybeSessionId: unknown = socket.handshake.auth[sessionIdKey]

  // todo remove this hack
  const cleaned =
    typeof maybeSessionId === "string"
      ? maybeSessionId.replaceAll('"', "").replaceAll("\\", "")
      : maybeSessionId

  const sessionId = SessionId.is(cleaned) ? cleaned : SessionId.generate()

  // move this inside frontend
  socket.emit("ToFrontend", ["Session", sessionId])

  if (ClientId.is(socket.id)) {
    onConnect.next([sessionId, socket.id])
  }

  socket.on("disconnect", () => {
    if (ClientId.is(socket.id)) {
      onDisconnect.next([sessionId, socket.id])
    }
  })

  socket.on("ToBackend", (msg) => {
    if (ClientId.is(socket.id)) {
      fromFrontend.next([sessionId, socket.id, msg])
    }
  })
})


const sendToFrontend = (clientIds: ClientId[], msg: ToFrontend): Cmd => () => {
  socketServer.to(clientIds).emit("ToFrontend", msg)
  socketServer.emit("ToFrontend", msg)
}

const broadcast = (msg: ToFrontend): Cmd => () => {
  socketServer.emit("ToFrontend", msg)
}


const port = Number(process.env['PORT']) || backendServerPort

httpServer.listen(port, () => {
  console.clear()
  console.log(`\n[backend] http server running at:`)
  console.log(`[backend] http://localhost:${port}/\n`)
})

//
//
//
// Main
//
//
//

const program = Platform.createProgram({
  init: init(),
  subscriptions,
  update,
})

program.sub$.subscribe((msg) => {
  program.$d(msg)
})

program.state$.subscribe(({ cmd }) => {
  cmd(program.$d)
})

// logging
program.state$.subscribe((state) => {
  const msg = state.msg?.flat(Infinity)
  const msgType = msg?.reduce<string | null>(
    (msgType, subMsgType) =>
      typeof subMsgType === "string"
        ? msgType
          ? `${msgType}.${subMsgType}`
          : subMsgType
        : msgType,
    null,
  )
  if (msgType) {
    console.log(msgType)
  }
})
