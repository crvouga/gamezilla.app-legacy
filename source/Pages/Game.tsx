import * as Games from "Games";
import * as UI from "UI";
import { Cmd, pipe } from "Core";
import { groupTag } from "Utility";

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

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None];
};

//
//
//
// View
//
//
//

export const view = (model: Model): UI.View<Msg> => {
  return pipe(Games.view(model), UI.map(groupTag("Game")));
};
