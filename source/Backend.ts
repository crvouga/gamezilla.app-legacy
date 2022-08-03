import { fromFrontend } from "./Bridge/Backend"
import { ClientId } from "./Bridge/Bridge"
import { Cmd, pipe, Platform, Sub, tag } from "./Core"
import * as Games from "./Games/Backend"
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
    games: Games.init,
    rooms: {},
    clients: {},
    users: {},
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
    case "ToBackend":
      return updateFromFrontend(msg[1], msg[2], model)

    case "Games":
      const [gamesNew, gamesCmd] = Games.update(msg[1], model.games)
      return [
        { ...model, games: gamesNew },
        pipe(gamesCmd, Cmd.map(tag("Games"))),
      ]
  }
}

export const updateFromFrontend = (
  clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "Games":
      const [gamesNew, gamesCmd] = Games.updateFromFrontend(
        clientId,
        msg[1],
        model.games,
      )
      return [
        { ...model, games: gamesNew },
        pipe(gamesCmd, Cmd.map(tag("Games"))),
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
    pipe(Games.subscriptions(), Sub.map(tag("Games"))),
    fromFrontend<BackendMsg>((clientId, toBackend) => [
      "ToBackend",
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

console.clear()
console.log("[backend] [program] running")
