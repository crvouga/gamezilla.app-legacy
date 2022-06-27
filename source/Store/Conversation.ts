import * as Route from "Route"
import * as Snackbar from "Snackbar"
import * as Supabase from "Supabase"
import { Cmd, RemoteData, Result, Task, pipe } from "Core"
import { Conversation, ProfilesConversations } from "Store"
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

export const Create = (creatorId: string, userIds: string[]) => {
  return {
    type: "Conversation/Create",
    group: "Store",
    entity: "Conversation",
    userIds,
    creatorId,
  } as const
}

export type Create = ReturnType<typeof Create>

type CreateResult = Result.Result<
  Problem,
  {
    conversation: Conversation
    profilesConversations: ProfilesConversations.ProfilesConversations[]
  }
>

export const Created = (userIds: string[], result: CreateResult) => {
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
              RemoteData.mapSuccess(
                (conversation) => conversation.conversation.conversationId,
              ),
            ),
            tag: "Conversation/Create",
          },
        },
      }

      switch (msg.result.type) {
        case "Err":
          return [modelNew, Cmd.none, []]

        case "Ok":
          const { conversation, profilesConversations } = msg.result.value
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
                ...profilesConversations.reduce<Model["ProfilesConversations"]>(
                  (byId, item) => ({
                    ...byId,
                    [`${item.conversationId}.${item.userId}`]: item,
                  }),
                  {},
                ),
              },
            },
            Route.replace({
              type: "ChatConversation",
              conversationId: msg.result.value.conversation.conversationId,
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
          insert({
            creatorId: action.creatorId,
            userIds: action.userIds,
          }),
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
  ({
    creatorId,
    userIds,
  }: {
    creatorId: string
    userIds: string[]
  }): Task.Task<CreateResult> =>
  async () => {
    const { data: conversationData, error: conversationError } =
      await Supabase.client
        .from<definitions["conversation"]>("conversation")
        .insert({})
        .single()

    if (conversationError) {
      return Result.Err({ message: conversationError.message })
    }

    const conversation = fromRow(conversationData)

    const {
      data: profilesConversationsData,
      error: profilesConversationsError,
    } = await Supabase.client
      .from<definitions["profiles_conversations"]>("profiles_conversations")
      .insert(
        [...userIds, creatorId].map((userId) => ({
          conversation_id: conversation.conversationId,
          user_id: userId,
        })),
      )

    if (profilesConversationsError) {
      const rollbackResponse = await Supabase.client
        .from<definitions["conversation"]>("conversation")
        .delete()
        .eq("id", conversation.conversationId)

      if (rollbackResponse.error) {
        return Result.Err({
          message: `${profilesConversationsError.message}. ${rollbackResponse.error}`,
        })
      }

      return Result.Err({ message: profilesConversationsError.message })
    }

    const profilesConversations = profilesConversationsData.map(
      ({ user_id, conversation_id }) => ({
        userId: user_id,
        conversationId: conversation_id,
      }),
    )

    return Result.Ok({ conversation, profilesConversations })
  }
