import * as Http from "http"
import * as Socket from "socket.io"
import { BackendModel, BackendMsg, ToBackend } from "./App.Types"
import * as Bridge from "./Bridge"
import { Cmd, pipe, Platform, Sub, tag, tagCmd } from "./Core"
import { remove } from "./Core/Record"
import { ClientId } from "./Data"
import * as GameRoom from "./GameRoom/GameRoom.Backend"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: [Model, Cmd.Cmd<Msg>] = [
  {
    gameRoom: GameRoom.init,
    clients: {},
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

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "[Frontend]":
      return updateFromFrontend(msg[1], msg[2], model)

    case "ClientConnected": {
      const clientId = msg[1]
      return [
        {
          ...model,
          clients: {
            ...model.clients,
            [clientId]: {
              clientId,
            },
          },
        },
        Bridge.sendToFrontend(
          [clientId],
          ["GameRoom", ["Sync", model.gameRoom]],
        ),
      ]
    }

    case "ClientDisconnected": {
      const clientId = msg[1]
      return [
        {
          ...model,
          clients: remove(clientId, model.clients),
        },
        Cmd.None,
      ]
    }

    case "GameRoom": {
      const [child, childCmd] = GameRoom.update(msg[1], model.gameRoom)
      return [{ ...model, gameRoom: child }, tagCmd("GameRoom", childCmd)]
    }
  }
}

export const updateFromFrontend = (
  clientId: ClientId.ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "GameRoom": {
      const [child, childCmd] = GameRoom.updateFromFrontend(
        clientId,
        msg[1],
        model.gameRoom,
      )
      return [{ ...model, gameRoom: child }, tagCmd("GameRoom", childCmd)]
    }
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.batch([
    pipe(GameRoom.subscriptions(model.gameRoom), Sub.map(tag("GameRoom"))),
    Bridge.onConnect((clientId) => ["ClientConnected", clientId]),
    Bridge.onDisconnect((clientId) => ["ClientDisconnected", clientId]),
    Bridge.fromFrontend<Msg>((clientId, toBackend) => [
      "[Frontend]",
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
  Bridge.ServerToClientEvents
>(httpServer, {
  cors: {
    origin: "*",
  },
})

socketServer.on("connection", (socket) => {
  if (ClientId.is(socket.id)) {
    Bridge._onConnect.next(socket.id)
  }

  socket.on("disconnect", () => {
    if (ClientId.is(socket.id)) {
      Bridge._onDisconnect.next(socket.id)
    }
  })

  socket.on("ToBackend", (msg) => {
    if (ClientId.is(socket.id)) {
      Bridge._toBackend.next([socket.id, msg])
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
