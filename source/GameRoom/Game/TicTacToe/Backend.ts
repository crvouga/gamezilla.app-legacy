import { ClientId } from "../../../Bridge/Bridge"
import { Cmd, Sub } from "../../../Core"
import { BackendModel, BackendMsg, initGame, ToBackend } from "./Types"

//
//
//
// ModelØ
//
//
//

export type Model = BackendModel

export const init: Model = initGame

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
  return Sub.batch<Msg>([])
}
