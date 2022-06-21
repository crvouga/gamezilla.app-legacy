import { flow, pipe } from "fp-ts/lib/function";
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
//
// View
//
//
//

export const view = (model: Model): View.View<Msg> => {
  return pipe(Games.view(model), View.map(groupTag("Game")));
};
