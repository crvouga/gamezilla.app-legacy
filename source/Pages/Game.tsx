import { flow, pipe } from "fp-ts/lib/function";
import { cmd } from "Framework";
import { Cmd } from "Framework/Cmd";
import * as Games from "Games";
import { groupTag } from "Utility";
import * as View from "View";

//
//
//
// Model
//
//
//

export type Model = Games.Model;

//
//
//
// Init
//
//
//

export const init = Games.init;

//
//
//
// Msg
//
//
//

export type Msg = Games.GroupedMsg;

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  return [model, cmd.none];
};

//
//
//
// View
//
//
//

export const view = (model: Model): View.View<Msg> => {
  return pipe(Games.view(model), View.map(groupTag("Game")));
};
