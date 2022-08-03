import * as TicTacToe from "./TicTacToe/Backend"
import { ClientId } from "../Bridge/Bridge"
import { Cmd, pipe, Sub, tag } from "../Core"
import { BackendModel, BackendMsg, ToBackend } from "./Types"

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
  users: {},
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
