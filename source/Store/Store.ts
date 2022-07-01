import * as Snackbar from "Snackbar";
import { Cmd, RemoteData } from "Core";
import * as Conversation from "./Conversation";
import * as Message from "./Message";
import * as Profile from "./Profile";
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
      Search: {},
    },
  },
  mutations: {
    Conversation: {
      GetElseCreate: RemoteData.NotAsked,
    },
    Profile: {
      Create: {},
      Edit: {},
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

export type GroupedMsg = Msg & { group: "Store" };

export type Action = Profile.Msg | Conversation.Action | Message.Action;

//
//
//
// Update
//
//
//

type OutAction = Snackbar.Action | Profile.Action;

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
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
      const [modelNew, cmdNew, _actions] = Profile.update(action, model);

      return [modelNew, cmdNew];
    }
  }
};
