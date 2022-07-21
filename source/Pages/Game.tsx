import * as Games from "../Games/Frontend"
import * as Store from "../Store"
import * as UI from "../UI"
import { Cmd } from "../Core"

//
//
//
// Model
//
//
//

export type Model = Games.Model

//
//
//
// Init
//
//
//

export const init = Games.init

//
//
//
// Msg
//
//
//

export type Msg = Games.Msg

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None]
}

//
//
//
// View
//
//
//

export const view = (
  deps: { currentUserId: string; store: Store.Model },
  model: Model,
): UI.View<Msg> => {
  return Games.view(deps, model)
}
