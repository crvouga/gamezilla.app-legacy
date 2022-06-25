import * as Snackbar from "Snackbar"
import { Cmd } from "Core"
import * as Conversation from "./Conversation"
import * as Profile from "./Profile"
import * as ProfilesConversations from "./ProfilesConversations"

//
//
//
// Model
//
//
//

export type Model = {
  Profile: {
    [id: string]: Profile.Profile
  }
  Conversation: {
    [id: string]: Conversation.Conversation
  }
  ProfilesConversations: {
    [id: string]: ProfilesConversations.ProfilesConversations
  }
  queries: {
    [id: string]: Query
  }
  mutations: {
    [id: string]: Mutation
  }
}

type Mutation = Profile.Mutation

type Query = Profile.Query

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
  queries: {},
  mutations: {},
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

export type Action = Profile.Msg | Conversation.Msg

//
//
//
// Update
//
//
//

type OutAction = Snackbar.Action

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
      const [modelNew, cmdNew, actions] = Conversation.update(action, model)

      return [modelNew, cmdNew]
    }

    case "Profile": {
      const [modelNew, cmdNew, actions] = Profile.update(action, model)

      return [modelNew, cmdNew]
    }
  }
}
