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

export type Model = {}

//
//
//
// Init
//
//
//

export const init: Model = {}

//
//
//
// Msg
//
//
//

export type Msg = []

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
  { games, currentUserId, store }: { games: Games.Model, currentUserId: string; store: Store.Model },
  _model: Model,
): UI.View<Games.Msg> => {
  return Games.view({ currentUserId, store }, games)
}
