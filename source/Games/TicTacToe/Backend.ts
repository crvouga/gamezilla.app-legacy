import * as Bridge from "../../Bridge/Backend"
import { ClientId } from "../../Bridge/Bridge"
import { Cmd, Sub } from "../../Core"
import * as Board from "./Board"
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from "./Types"

//
//
//
// ModelØ
//
//
//

export type Model = BackendModel

export const init: Model = {
  game: {
    board: Board.emptyBoard,
    players: {
      O: { type: "None" },
      X: { type: "None" },
    },
  },
}

//
//
//
// Bridge
//
//
//

const broadcast = (toFrontend: ToFrontend): Cmd.Cmd<never> => {
  // return Bridge.broadcast(["Games", ["", ]])
  return Cmd.None
}

const sendToFrontend = (
  clientId: string,
  toFrontend: ToFrontend,
): Cmd.Cmd<never> => {
  // return Bridge.sendToFrontend(clientId, ["Games", ["TicTacToe", toFrontend]])
  return Cmd.None
}

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None]
}

export const updateFromFrontend = (
  clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (): Sub.Sub<Msg> => {
  return Sub.batch<Msg>([
    Bridge.onConnect((clientId) => ["ClientConnected", clientId]),
    Bridge.onDisconnect((clientId) => ["ClientDisconnected", clientId]),
  ])
}
