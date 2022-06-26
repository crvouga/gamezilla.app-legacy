import * as Route from "Route"
import * as Snackbar from "Snackbar"
import * as Supabase from "Supabase"
import { Cmd, RemoteData, Result, Task, pipe } from "Core"
import { Conversation } from "Store"
import { definitions } from "supabase-types"
import * as Store from "./Store"

//
//
//
// Model
//
//
//

type Model = Store.Model

export type ChatId = string

export type Conversation = {
  conversationId: ChatId
}

type Problem = { message: string }

export type Mutation = CreateMutation

export type CreateMutation = RemoteData.RemoteData<Problem, ChatId> & {
  tag: "Conversation/Create"
}

export type Query = RemoteData.RemoteData<Problem, ChatId> & {
  tag: "Converation/Get"
}

export const CreateId = "Conversation/Create" as const

export const toCreateMutation = (model: Model): CreateMutation => {
  const fallback: Mutation = {
    ...RemoteData.NotAsked,
    tag: "Conversation/Create",
  }

  const mutation = model.mutations[CreateId] ?? fallback

  if (mutation.tag === "Conversation/Create") {
    return mutation
  }

  return fallback
}

//
//
//
// Msg
//
//
//

export type Msg = Created

export type Action = Create

export const Create = (userIds: string[]) => {
  return {
    type: "Conversation/Create",
    group: "Store",
    entity: "Conversation",
    userIds,
  } as const
}

export type Create = ReturnType<typeof Create>

export const Created = (
  userIds: string[],
  result: Result.Result<Problem, Conversation>,
) => {
  return {
    type: "Conversation/Created",
    group: "Store",
    entity: "Conversation",
    userIds,
    result,
  } as const
}

export type Created = ReturnType<typeof Created>

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
  switch (msg.type) {
    case "Conversation/Created":
      const modelNew: Model = {
        ...model,
        mutations: {
          ...model.mutations,
          [CreateId]: {
            ...pipe(
              msg.result,
              RemoteData.fromResult,
              RemoteData.map((conversation) => conversation.conversationId),
            ),
            tag: "Conversation/Create",
          },
        },
      }

      switch (msg.result.type) {
        case "Err":
          return [modelNew, Cmd.none, []]

        case "Ok":
          const conversation = msg.result.value
          const { conversationId } = conversation
          return [
            {
              ...modelNew,
              Conversation: {
                ...modelNew.Conversation,
                [conversationId]: conversation,
              },
              ProfilesConversations: {
                ...modelNew.ProfilesConversations,
                ...msg.userIds
                  .map((userId) => ({ userId, conversationId }))
                  .reduce<Model["ProfilesConversations"]>(
                    (byId, item) => ({
                      ...byId,
                      [`${item.conversationId}.${item.userId}`]: item,
                    }),
                    {},
                  ),
              },
            },
            Route.push({
              type: "ChatConversation",
              conversationId: msg.result.value.conversationId,
            }),
            [],
          ]
      }
  }
}

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action.type) {
    case "Conversation/Create":
      const mutationsNew: Model["mutations"] = {
        ...model.mutations,
        [CreateId]: {
          ...RemoteData.Loading,
          tag: "Conversation/Create",
        },
      }
      return [
        { ...model, mutations: mutationsNew },
        pipe(
          insert(),
          Cmd.fromTask((result) => Created(action.userIds, result)),
        ),
      ]
  }
}

//
//
//
// Data Access
//
//
//

const fromRow = (row: definitions["conversation"]): Conversation => {
  return {
    conversationId: row.id,
  }
}

export const insert =
  (): Task.Task<Result.Result<Problem, Conversation>> => async () => {
    const response = await Supabase.client
      .from<definitions["conversation"]>("conversation")
      .insert({})
      .single()

    if (response.error) {
      return Result.Err({ message: response.error.message })
    }

    return Result.Ok(fromRow(response.data))
  }
