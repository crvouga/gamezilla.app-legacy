import * as Snackbar from "Snackbar"
import { Cmd, RemoteData } from "Core"
import * as Conversation from "./Conversation"
import * as Profile from "./Profile"
import { Store } from "./Types"

//
//
//
// Model
//
//
//

export type Model = Store
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
  queries: {
    Conversation: {
      Get: {},
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
}

//
//
//
// Msg
//
//
//

export type Msg = Profile.Msg | Conversation.Msg

export type GroupedMsg = Msg & { group: "Store" }

export type Action = Profile.Msg | Conversation.Action

//
//
//
// Update
//
//
//

type OutAction = Snackbar.Action | Profile.Action

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.entity) {
    case "Conversation": {
      const [modelNew, cmdNew, actions] = Conversation.update(msg, model)

      return [modelNew, cmdNew, actions]
    }

    case "Profile": {
      const [modelNew, cmdNew, actions] = Profile.update(msg, model)

      return [modelNew, cmdNew, actions]
    }
  }
}

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action.entity) {
    case "Conversation": {
      const [modelNew, cmdNew] = Conversation.runAction(action, model)

      return [modelNew, cmdNew]
    }

    case "Profile": {
      const [modelNew, cmdNew, actions] = Profile.update(action, model)

      return [modelNew, cmdNew]
    }
  }
}
