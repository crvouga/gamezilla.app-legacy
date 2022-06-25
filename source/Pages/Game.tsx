import * as Games from "Games"
import * as View from "View"
import { Cmd } from "Core"
import { groupTag } from "Utility"
import { pipe } from "fp-ts/lib/function"

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

export type Msg = Games.GroupedMsg

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.none]
}

//
//
//
// View
//
//
//

export const view = (model: Model): View.View<Msg> => {
  return pipe(Games.view(model), View.map(groupTag("Game")))
}
