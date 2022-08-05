import * as Bridge from "../Bridge/Backend"
import * as TicTacToe from "./TicTacToe/Backend"
import { ClientId } from "../Bridge/Bridge"
import { Cmd, exhaustive, pipe, Sub, tag } from "../Core"
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from "./Types"
import * as Room from "./Room"

//
//
//
// Model
//
//
//

type Model = BackendModel

export const init: Model = {
  ticTacToe: TicTacToe.init,
  rooms: {},
  users: {},
}

//
//
//
// Bridge
//
//
//

const broadcast = (toFrontend: ToFrontend) => {
  return Bridge.broadcast(["Games", toFrontend])
}

const sendToFrontend = (
  clientIds: string | string[],
  toFrontend: ToFrontend,
) => {
  return Bridge.sendToFrontend(clientIds, ["Games", toFrontend])
}

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
    case "TicTacToe": {
      const [childNew, childCmd] = TicTacToe.update(msg[1], model.ticTacToe)
      return [
        { ...model, ticTacToe: childNew },
        pipe(childCmd, Cmd.map(tag("TicTacToe"))),
      ]
    }
  }
}

export const updateFromFrontend = (
  clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "TicTacToe": {
      const [childNew, childCmd] = TicTacToe.updateFromFrontend(
        clientId,
        msg[1],
        model.ticTacToe,
      )
      return [
        { ...model, ticTacToe: childNew },
        pipe(childCmd, Cmd.map(tag("TicTacToe"))),
      ]
    }

    case "CreateRoom": {
      const result = Room.createRoom(msg[1], model)

      const toFrontend = sendToFrontend(clientId, [
        "CreateRoomResulted",
        result,
      ])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      const modelNew: Model = {
        ...model,
        ...result.value.model,
      }

      return [modelNew, Cmd.batch([broadcast(["Sync", modelNew]), toFrontend])]
    }

    case "Init": {
      return [model, Cmd.batch([sendToFrontend(clientId, ["Sync", model])])]
    }

    default:
      return exhaustive(msg[0])
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
  return Sub.batch([pipe(TicTacToe.subscriptions(), Sub.map(tag("TicTacToe")))])
}
