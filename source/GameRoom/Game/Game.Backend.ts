import { Cmd, Sub } from "../../Core";
import { BackendModel, BackendMsg } from "./Game.Types";

//
//
//
// Model
//
//
//

export type Model = BackendModel;

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch(msg[0]) {
    
    default: {
      return [model, Cmd.None]
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.None;
};
