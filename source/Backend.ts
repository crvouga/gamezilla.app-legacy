import * as Bridge from "./Bridge/Backend"
import { ClientId } from "./Bridge/Bridge"
import { Cmd, Debug, pipe, Platform, Sub, tag } from "./Core"
import * as GameRoom from "./GameRoom/Backend"
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
      return [model, Cmd.None]
    }

    case "ClientDisconnected": {
      return [model, Cmd.None]
    }

    case "GameRoom":
      const [child, childCmd] = GameRoom.update(msg[1], model.gameRoom)
      return [
        { ...model, gameRoom: child },
        pipe(childCmd, Cmd.map(tag("GameRoom"))),
      ]
  }
}

export const updateFromFrontend = (
  clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "GameRoom":
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

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (): Sub.Sub<BackendMsg> => {
  return Sub.batch([
    pipe(GameRoom.subscriptions(), Sub.map(tag("GameRoom"))),
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

program.state$.subscribe((state) => {
  console.log(
    JSON.stringify(
      {
        model: state.model,
        msg: Debug.formatMsg(state.msg),
      },
      null,
      4,
    ),
  )
})

//
// memory leak duck tape
//

setInterval(() => {
  console.log("\n")
  for (const [key, value] of Object.entries(process.memoryUsage())) {
    console.log(`[backend] memory usage by ${key}: ${value / 1000000}MB`)
  }
  console.log("\n")
}, 1000 * 3)
