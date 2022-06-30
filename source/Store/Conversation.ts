import * as Route from "Route"
import * as Snackbar from "Snackbar"
import * as Supabase from "Supabase"
import { Cmd, RemoteData, Result, Task, pipe } from "Core"
import produce from "immer"
import { definitions } from "supabase-types"
import * as Types from "./Types"
import { Problem, Profile, ProfilesConversations, Store } from "./Types"

//
//
//
// Model
//
//
//

export type Conversation = Types.Conversation

//
//
//
// Msg
//
//
//

export type Msg = Inserted

export type Action = Insert

export const Insert = (creatorId: string, userIds: string[]) => {
  return {
    type: "Conversation/Insert",
    group: "Store",
    entity: "Conversation",
    userIds,
    creatorId,
  } as const
}

export type Insert = ReturnType<typeof Insert>

export const Inserted = (
  userIds: string[],
  result: Result.Result<
    Problem,
    {
      conversation: Conversation
      profilesConversations: ProfilesConversations[]
    }
  >,
) => {
  return {
    type: "Conversation/Inserted",
    group: "Store",
    entity: "Conversation",
    userIds,
    result,
  } as const
}

export type Inserted = ReturnType<typeof Inserted>

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
  model: Store,
): [Store, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.type) {
    case "Conversation/Inserted":
      const { result } = msg

      const modelNew = produce(model, (model) => {
        model.mutations.Conversation.GetElseCreate = pipe(
          result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((value) => value.conversation.conversationId),
        )

        switch (result.type) {
          case "Err":
            break

          case "Ok":
            const { conversation, profilesConversations } = result.value
            const { conversationId } = conversation
            model.Conversation[conversationId] = conversation
            for (const item of profilesConversations) {
              const id = [item.conversationId, item.userId].join(",")
              model.ProfilesConversations[id] = item
            }
            break
        }
      })

      const cmdNew: Cmd.Cmd<Msg> =
        result.type === "Ok"
          ? Route.replace({
              type: "ChatConversation",
              conversationId: result.value.conversation.conversationId,
            })
          : Cmd.None

      return [modelNew, cmdNew, []]
  }
}

export const runAction = (
  action: Action,
  model: Store,
): [Store, Cmd.Cmd<Msg>] => {
  switch (action.type) {
    case "Conversation/Insert":
      const modelNew = produce(model, (model) => {
        model.mutations.Conversation.GetElseCreate = RemoteData.Loading
      })

      return [
        modelNew,

        pipe(
          insert({
            creatorId: action.creatorId,
            userIds: action.userIds,
          }),
          Cmd.fromTask((result) => Inserted(action.userIds, result)),
        ),
      ]
  }
}

//
//
//
// Selectors
//
//
//

export const toConversation = (
  conversationId: string,
  store: Store,
): {
  conversationId: string
  profiles: Profile[]
} => {
  const profiles = Object.values(store.ProfilesConversations)
    .filter((row) => row.conversationId === conversationId)
    .flatMap((row) => {
      const maybeProfile = store.Profile[row.userId]
      if (maybeProfile) {
        return [maybeProfile]
      }
      return []
    })

  return {
    conversationId: conversationId,
    profiles,
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
  }): Task.Task<
    Result.Result<
      Problem,
      {
        conversation: Conversation
        profilesConversations: ProfilesConversations[]
      }
    >
  > =>
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
