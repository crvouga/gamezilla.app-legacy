import * as Http from "http"
import * as Socket from "socket.io"
import * as Bridge from "./Bridge"
import { Cmd, Debug, pipe, Platform, Sub, tag } from "./Core"
import { ClientId } from "./Data"
import * as GameRoom from "./GameRoom/GameRoom.Backend"
import { BackendModel, BackendMsg, ToBackend } from "./Types"

//
//
//
// Model
//
//
//

type Model = BackendModel

export const init: [Model, Cmd.Cmd<BackendMsg>] = [
  {
    gameRoom: GameRoom.init,
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

export const update = (
  msg: BackendMsg,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "FrontendToBackend":
      return updateFromFrontend(msg[1], msg[2], model)

    case "ClientConnected": {
      const clientId = msg[1]
      return [
        model,
        Bridge.sendToFrontend([clientId], [
          "GameRoom",
          ["Sync", model.gameRoom],
        ]),
      ]
    }

    case "ClientDisconnected": {
      return [model, Cmd.None]
    }

    case "GameRoom": {
      const [child, childCmd] = GameRoom.update(msg[1], model.gameRoom)
      return [
        { ...model, gameRoom: child },
        pipe(childCmd, Cmd.map(tag("GameRoom"))),
      ]
    }
  }
}

export const updateFromFrontend = (
  clientId: ClientId.ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "GameRoom": {
      const [child, childCmd] = GameRoom.updateFromFrontend(
        clientId,
        msg[1],
        model.gameRoom,
      )
      return [
        { ...model, gameRoom: child },
        pipe(childCmd, Cmd.map(tag("GameRoom"))),
      ]
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

export const subscriptions = (): Sub.Sub<BackendMsg> => {
  return Sub.batch([
    // pipe(GameRoom.subscriptions(), Sub.map(tag("GameRoom"))),
    Bridge.onConnect((clientId) => ["ClientConnected", clientId]),
    Bridge.onDisconnect((clientId) => ["ClientDisconnected", clientId]),
    Bridge.fromFrontend<BackendMsg>((clientId, toBackend) => [
      "FrontendToBackend",
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

//
// logging
//

console.clear()
console.log("[backend] [program] running")

//
//
//
// Server
//
//
//

const requestListener: Http.RequestListener = (_request, response) => {
  const state = program.state$.getValue()
  response.end(JSON.stringify({ model: state.model, msg: state.msg }))
}

const httpServer = Http.createServer(requestListener)

const socketServer = new Socket.Server<Bridge.ClientToServerEvents, Bridge.ServerToClientEvents>(
  httpServer,
  {
    cors: {
      origin: "*",
    },
  },
)

socketServer.on("connection", (socket) => {  
  if(ClientId.is(socket.id)) {
    Bridge.onConnect$.next(socket.id)
  }

  socket.on("disconnect", () => {
    if(ClientId.is(socket.id)) {
      Bridge.onDisconnect$.next(socket.id)
    }
  })

  socket.on("ToBackend", (msg) => {
    if(ClientId.is(socket.id)) {
      Bridge.toBackend$.next([socket.id, msg])
    }
  })
})

Bridge.sendToFrontend$.subscribe(([clientIds, msg]) => {
  socketServer.to(clientIds).emit("ToFrontend", msg)
})

Bridge.broadcast$.subscribe((msg) => {
  socketServer.emit("ToFrontend", msg)
})

const port = Number(process.env.PORT) || Bridge.backendServerPort

httpServer.listen(port, () => {
  console.clear()
  console.log(`[backend] http server running at:`)
  console.log(`[backend] http://localhost:${port}/`)
})
