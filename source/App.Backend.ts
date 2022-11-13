import * as Http from "http"
import * as Socket from "socket.io"
import {
  BackendModel,
  BackendMsg,
  Session,
  ToBackend,
  ToFrontend,
} from "./App.Types"
import {
  Cmd,
  exhaustive,
  Option,
  p,
  Platform,
  Sub,
  t,
  tagCmd,
} from "./Core"
import { ClientId, SessionId, UserId } from "./Data"
import * as GameRoom from "./Game/GameRoom.Backend"
import * as Party from "./Party/Party.Backend"
import * as Wire from "./Wire"
import { formatMsg } from "./Core/Debug"

//
//
//
// Model
//
//
//

type Model = BackendModel

const init = (): [Model, Cmd<Msg>] => {
  const [party, partyCmd] = Party.init()
  return [
    {
      gameRoom: GameRoom.init,
      sessions: {},
      party,
    },
    tagCmd("Party", partyCmd),
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

      const partyCmd = Party.onClientConnected(
        {
          sendToUser: (userIds, msg) =>
            sendToUser(modelNew, userIds, ["Party", msg]),
        },
        maybeUserId,
        model.party,
      )

      const gameRoomCmd = GameRoom.onClientConnected(
        {
          sendToClient: (msg) =>
            Wire.sendToFrontend([clientId], ["GameRoom", msg]),
        },
        model.gameRoom,
      )

      return [
        modelNew,
        Cmd.batch<Msg>([
          tagCmd("GameRoom", gameRoomCmd),
          tagCmd("Party", partyCmd),
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
          broadcast: (msg) => Wire.broadcast(["Party", msg]),
          sendToUser: (userId, msg) =>
            sendToUser(model, userId, ["Party", msg]),
        },
        msg[1],
        model.party,
      )

      return [{ ...model, party: child }, tagCmd("Party", childCmd)]
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

      return [{ ...model, gameRoom: child }, tagCmd("GameRoom", childCmd)]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

const updateFromFrontend = (
  sessionId: SessionId.SessionId,
  clientId: ClientId.ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd<Msg>] => {
  const sendToClient = (msg: ToFrontend) => Wire.sendToFrontend([clientId], msg)

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
          broadcast: (msg) => Wire.broadcast(["Party", msg]),
          sendToUser: (userIds, msg) =>
            sendToUser(model, userIds, ["Party", msg]),
        },
        msg[1],
        model.party,
      )

      return [{ ...model, party: child }, tagCmd("Party", childCmd)]
    }

    case "GameRoom": {
      const [child, childCmd] = GameRoom.updateFromFrontend(
        {
          broadcast: (msg) => Wire.broadcast(["GameRoom", msg]),
          sendToClient: (msg) => sendToClient(["GameRoom", msg]),
          sendToUser: (userIds, msg) =>
            sendToUser(model, userIds, ["GameRoom", msg]),
        },
        msg[1],
        model.gameRoom,
      )

      return [{ ...model, gameRoom: child }, tagCmd("GameRoom", childCmd)]
    }

  }
}

const sendToUser = (
  model: Model,
  userIds: UserId.UserId[],
  msg: ToFrontend,
) => {
  const clientIds: ClientId.ClientId[] = []

  const userIdSet = new Set<UserId.UserId>(userIds)

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


  return Wire.sendToFrontend(clientIds, msg)
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
    Wire.onConnect((sessionId, clientId) => [
      "ClientConnected",
      sessionId,
      clientId,
    ]),
    Wire.onDisconnect((sessionId, clientId) => [
      "ClientDisconnected",
      sessionId,
      clientId,
    ]),
    Wire.fromFrontend<Msg>((sessionId, clientId, toBackend) => [
      "▶",
      sessionId,
      clientId,
      toBackend,
    ]),
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
  Wire.ClientToServerEvents,
  Wire.ServerToClientEvents,
  Wire.InterServerEvents,
  Wire.SocketData
>(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
  cookie: true,
})

socketServer.on("connection", (socket) => {
  const maybeSessionId: unknown = socket.handshake.auth[Wire.sessionIdKey]

  // todo remove this hack
  const cleaned =
    typeof maybeSessionId === "string"
      ? maybeSessionId.replaceAll('"', "").replaceAll("\\", "")
      : maybeSessionId

  const sessionId = SessionId.is(cleaned) ? cleaned : SessionId.generate()

  socket.emit("ToFrontend", ["Session", sessionId])

  if (ClientId.is(socket.id)) {
    Wire._onConnect.next([sessionId, socket.id])
  }

  socket.on("disconnect", () => {
    if (ClientId.is(socket.id)) {
      Wire._onDisconnect.next([sessionId, socket.id])
    }
  })

  socket.on("ToBackend", (msg) => {
    if (ClientId.is(socket.id)) {
      Wire._toBackend.next([sessionId, socket.id, msg])
    }
  })
})

Wire._sendToFrontend.subscribe(([clientIds, msg]) => {
  socketServer.to(clientIds).emit("ToFrontend", msg)
})

Wire._broadcast.subscribe((msg) => {
  socketServer.emit("ToFrontend", msg)
})

const port = Number(process.env['PORT']) || Wire.backendServerPort

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
  program.dispatch(msg)
})

program.state$.subscribe(({ cmd }) => {
  cmd(program.dispatch)
})

//
//
//
// Logging
//
//
//

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
