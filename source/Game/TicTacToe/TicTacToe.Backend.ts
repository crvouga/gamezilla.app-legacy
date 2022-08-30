import { Cmd, Sub } from "../../Core"
import { ClientId } from "../../Data"
import {
  BackendModel,
  BackendMsg,
  initSharedModel,
  ToBackend,
} from "./TicTacToe.Types"

//
//
//
// ModelØ
//
//
//

export type Model = BackendModel

export const init: Model = initSharedModel

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

export const subscriptions = (_model: Model): Sub.Sub<Msg> => {
  return Sub.batch<Msg>([])
}
