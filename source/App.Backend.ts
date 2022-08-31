import * as Http from "http"
import * as Socket from "socket.io"
import {
  BackendModel,
  BackendMsg,
  Session,
  ToBackend,
  ToFrontend,
} from "./App.Types"
import * as Bridge from "./Bridge"
import { Cmd, Option, pipe, Platform, Sub, tag, tagCmd } from "./Core"
import { removeKey } from "./Core/Record"
import { ClientId, SessionId, UserId } from "./Data"
import * as GameRoom from "./GameRoom/GameRoom.Backend"

//
//
//
// Model
//
//
//

type Model = BackendModel

const init: [Model, Cmd.Cmd<Msg>] = [
  {
    gameRoom: GameRoom.init,
    sessions: {},
  },
  Cmd.None,
]

//
//
//
// Update
//
//
//

type Msg = BackendMsg

const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "[Frontend]":
      return updateFromFrontend(msg[1], msg[2], msg[3], model)

    case "ClientConnected": {
      const sessionId = msg[1]
      const clientId = msg[2]
      const session: Session = {
        sessionId,
        clientId,
        userId: Option.None,
      }
      return [
        {
          ...model,
          sessions: {
            ...model.sessions,
            [sessionId]: session,
          },
        },
        Bridge.sendToFrontend(
          [clientId],
          ["GameRoom", ["Sync", model.gameRoom]],
        ),
      ]
    }

    case "ClientDisconnected": {
      const sessionId = msg[1]
      return [
        {
          ...model,
          sessions: removeKey(sessionId, model.sessions),
        },
        Cmd.None,
      ]
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
  }
}

const updateFromFrontend = (
  sessionId: SessionId.SessionId,
  clientId: ClientId.ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  const sendToClient = (msg: ToFrontend) => {
    return Bridge.sendToFrontend([clientId], msg)
  }

  switch (msg[0]) {
    case "UserLoggedIn": {
      return [
        {
          ...model,
          sessions: {
            ...model.sessions,
            [sessionId]: {
              sessionId,
              clientId,
              userId: msg[1],
            },
          },
        },
        Cmd.None,
      ]
    }

    case "GameRoom": {
      const [child, childCmd] = GameRoom.updateFromFrontend(
        {
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
  const clientIds = Object.values(model.sessions)
    .filter(
      (session) =>
        session.userId.type === "Some" &&
        userIds.includes(session.userId.value),
    )
    .map((session) => session.clientId)

  return Bridge.sendToFrontend(clientIds, msg)
}

//
//
//
// Subscriptions
//
//
//

const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.batch([
    pipe(GameRoom.subscriptions(model.gameRoom), Sub.map(tag("GameRoom"))),
    Bridge.onConnect((sessionId, clientId) => [
      "ClientConnected",
      sessionId,
      clientId,
    ]),
    Bridge.onDisconnect((sessionId, clientId) => [
      "ClientDisconnected",
      sessionId,
      clientId,
    ]),
    Bridge.fromFrontend<Msg>((sessionId, clientId, toBackend) => [
      "[Frontend]",
      sessionId,
      clientId,
      toBackend,
    ]),
  ])
}

//
//
//
// Main
//
//
//

const program = Platform.worker({
  init,
  subscriptions,
  update,
})

Platform.run(program)

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
  console.log(msgType)
})

//
//
//
// Server
//
//
//

const requestListener: Http.RequestListener = (_request, response) => {
  const state = program.state$.getValue()
  const msgType = state.msg
    ?.flat(Infinity)
    .reduce<string | null>(
      (msgType, subMsgType) =>
        typeof subMsgType === "string"
          ? msgType
            ? `${msgType}.${subMsgType}`
            : subMsgType
          : msgType,
      null,
    )
  response.end(JSON.stringify({ msgType: msgType, model: state.model }))
}

const httpServer = Http.createServer(requestListener)

const socketServer = new Socket.Server<
  Bridge.ClientToServerEvents,
  Bridge.ServerToClientEvents,
  Bridge.InterServerEvents,
  Bridge.SocketData
>(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
  cookie: true,
})

socketServer.on("connection", (socket) => {
  const maybeSessionId: unknown = socket.handshake.auth[Bridge.sessionIdKey]

  console.log(maybeSessionId)

  // todo remove this hack
  const cleaned =
    typeof maybeSessionId === "string"
      ? maybeSessionId.replaceAll('"', "").replaceAll("\\", "")
      : maybeSessionId

  const sessionId = SessionId.is(cleaned) ? cleaned : SessionId.generate()

  socket.emit("ToFrontend", ["Session", sessionId])

  if (ClientId.is(socket.id)) {
    Bridge._onConnect.next([sessionId, socket.id])
  }

  socket.on("disconnect", () => {
    if (ClientId.is(socket.id)) {
      Bridge._onDisconnect.next([sessionId, socket.id])
    }
  })

  socket.on("ToBackend", (msg) => {
    if (ClientId.is(socket.id)) {
      Bridge._toBackend.next([sessionId, socket.id, msg])
    }
  })
})

Bridge._sendToFrontend.subscribe(([clientIds, msg]) => {
  socketServer.to(clientIds).emit("ToFrontend", msg)
})

Bridge._broadcast.subscribe((msg) => {
  socketServer.emit("ToFrontend", msg)
})

const port = Number(process.env.PORT) || Bridge.backendServerPort

httpServer.listen(port, () => {
  console.clear()
  console.log(`\n[backend] http server running at:`)
  console.log(`[backend] http://localhost:${port}/\n`)
})
