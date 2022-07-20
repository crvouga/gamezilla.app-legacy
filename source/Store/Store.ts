import { Cmd, pipe } from "../Core";
import { tag } from "../Core";
import * as Conversation from "./Conversation";
import * as Message from "./Message";
import * as Profile from "./Profile";
import { initialStore, Store } from "./Types";

//
//
//
// Model
//
//
//

export type Model = Store;

export const init = initialStore;

//
//
//
// Msg
//
//
//

export type Msg =
  | ["Profile", Profile.Msg]
  | ["Conversation", Conversation.Msg]
  | ["Message", Message.Msg];

export type Action =
  | ["Store", ["Profile", Profile.Action]]
  | ["Store", ["Conversation", Conversation.Action]]
  | ["Store", ["Message", Message.Action]];

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Conversation": {
      const [modelNew, cmd] = Conversation.update(msg[1], model);
      return [modelNew, pipe(cmd, Cmd.map(tag("Conversation")))];
    }

    case "Profile": {
      const [modelNew, cmd] = Profile.update(msg[1], model);
      return [modelNew, pipe(cmd, Cmd.map(tag("Profile")))];
    }

    case "Message": {
      const [modelNew, cmd] = Message.update(msg[1], model);
      return [modelNew, pipe(cmd, Cmd.map(tag("Message")))];
    }
  }
};

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action[1][0]) {
    case "Conversation": {
      const [modelNew, cmd] = Conversation.runAction(action[1][1], model);
      return [modelNew, pipe(cmd, Cmd.map(tag("Conversation")))];
    }

    case "Message": {
      const [modelNew, cmd] = Message.runAction(action[1][1], model);
      return [modelNew, pipe(cmd, Cmd.map(tag("Message")))];
    }

    case "Profile": {
      const [modelNew, cmd] = Profile.runAction(action[1][1], model);
      return [modelNew, pipe(cmd, Cmd.map(tag("Profile")))];
    }
  }
};
