import * as Snackbar from "../Snackbar";
import * as Conversation from "./Conversation";
import * as Message from "./Message";
import * as Profile from "./Profile";
import { Cmd, RemoteData } from "../Core";
import { Store } from "./Types";

//
//
//
// Model
//
//
//

export type Model = Store;
//
//
//
// Init
//
//
//

export const init: Model = {
  Profile: {},
  Conversation: {},
  ProfilesConversations: {},
  Message: {},
  queries: {
    Conversation: {
      FindOne: {},
      FindManyByUserId: {},
    },
    Profile: {
      Get: {},
      GetMany: RemoteData.NotAsked,
      Search: {},
    },
  },
  mutations: {
    Conversation: {
      FindElseInsert: RemoteData.NotAsked,
    },
    Profile: {
      Create: {},
      Edit: {},
      DeleteForever: {},
    },
    Message: {
      Insert: {},
      DeleteForever: {},
    },
  },
};

//
//
//
// Msg
//
//
//

export type Msg = Profile.Msg | Conversation.Msg | Message.Msg;

export type Action = Profile.Action | Conversation.Action | Message.Action;

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.entity) {
    case "Conversation": {
      return Conversation.update(msg, model);
    }

    case "Profile": {
      return Profile.update(msg, model);
    }

    case "Message": {
      return Message.update(msg, model);
    }
  }
};

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action.entity) {
    case "Conversation": {
      return Conversation.runAction(action, model);
    }

    case "Message": {
      return Message.runAction(action, model);
    }

    case "Profile": {
      return Profile.runAction(action, model);
    }
  }
};
