import produce from "immer"
import { Cmd, Option, pipe, RemoteData, Result, Task } from "../Core"
import { UserId } from "../Data"
import * as Route from "../Route"
import * as Supabase from "../Supabase"
import { definitions } from "../Supabase.Types"
import { decodeRow } from "./Profile"
import * as Types from "./Types"
import {
  Message,
  Problem,
  Profile,
  ProfilesConversations,
  Store,
} from "./Types"

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

export type Msg =
  | FindOneElseInsertResulted
  | FindManyByUserIdResulted
  | FindOneResulted

export type Action = FindOneElseInsert | FindManyByUserId | FindOne

type FindOneResult = Result.Result<
  Problem,
  {
    conversation: Conversation
    profiles: Profile[]
    profilesConversations: ProfilesConversations[]
    messages: Message[]
  }
>

export type FindOneElseInsert = [
  "FindOneElseInsert",
  { userIds: UserId.UserId[] },
]
export type FindOneElseInsertResulted = [
  "FindOneElseInsertResulted",
  { userIds: UserId.UserId[]; result: FindOneResult },
]

export type FindManyByUserId = ["FindManyByUserId", { userId: UserId.UserId }]
export type FindManyByUserIdResulted = [
  "FindManyByUserIdResulted",
  {
    userId: UserId.UserId
    result: Result.Result<
      Problem,
      {
        conversations: Conversation[]
        profiles: Profile[]
        profilesConversations: ProfilesConversations[]
      }
    >
  },
]

export type FindOne = ["FindOne", { conversationId: string }]
export type FindOneResulted = [
  "FindOneResulted",
  { conversationId: string; result: FindOneResult },
]

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Store): [Store, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "FindOneResulted": {
      const { conversationId, result } = msg[1]
      const modelNew = produce(model, (model) => {
        model.queries.Conversation.FindOne[conversationId] = pipe(
          result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((item) => ({
            conversation: item.conversation.conversationId,
            profile: item.profiles.map((item) => item.userId),
            message: item.messages.map((item) => item.messageId),
          })),
        )

        switch (result.type) {
          case "Err":
            break

          case "Ok": {
            const data = result.value
            model.Conversation[data.conversation.conversationId] =
              data.conversation

            for (const message of data.messages) {
              model.Message[message.messageId] = message
            }

            for (const profile of data.profiles) {
              model.Profile[profile.userId] = profile

              const profileConversation = {
                userId: profile.userId,
                conversationId: data.conversation.conversationId,
              }
              const id = Types.toProfilesConversationsId(profileConversation)
              model.ProfilesConversations[id] = profileConversation
            }
          }
        }
      })

      return [modelNew, Cmd.None]
    }

    case "FindManyByUserIdResulted": {
      const { userId, result } = msg[1]
      const modelNew = produce(model, (model) => {
        model.queries.Conversation.FindManyByUserId[userId] = pipe(
          result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((data) => ({
            conversation: data.conversations.map((item) => item.conversationId),
            profile: data.profiles.map((item) => item.userId),
            profilesConversations: data.profilesConversations.map(
              Types.toProfilesConversationsId,
            ),
          })),
        )

        switch (result.type) {
          case "Err":
            break

          case "Ok": {
            const data = result.value
            for (const item of data.conversations) {
              model.Conversation[item.conversationId] = item
            }

            for (const item of data.profiles) {
              model.Profile[item.userId] = item
            }

            for (const item of data.profilesConversations) {
              const id = Types.toProfilesConversationsId(item)
              model.ProfilesConversations[id] = item
            }
          }
        }
      })

      return [modelNew, Cmd.None]
    }

    case "FindOneElseInsertResulted":
      const { result } = msg[1]

      const modelNew = produce(model, (model) => {
        model.mutations.Conversation.FindElseInsert = pipe(
          result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((item) => item.conversation.conversationId),
        )

        switch (result.type) {
          case "Err":
            break

          case "Ok": {
            const data = result.value

            model.Conversation[data.conversation.conversationId] =
              data.conversation

            for (const item of data.profilesConversations) {
              const id = Types.toProfilesConversationsId(item)
              model.ProfilesConversations[id] = item
            }
          }
        }
      })

      // todo put this logic elsewhere
      const cmdNew: Cmd.Cmd<Msg> =
        result.type === "Ok"
          ? Route.push({
              type: "ChatConversation",
              conversationId: result.value.conversation.conversationId,
            })
          : Cmd.None

      return [modelNew, cmdNew]
  }
}

export const updateFromAction = (
  action: Action,
  model: Store,
): [Store, Cmd.Cmd<Msg>] => {
  switch (action[0]) {
    case "FindOne": {
      const { conversationId } = action[1]
      const modelNew = produce(model, (model) => {
        model.queries.Conversation.FindOne[conversationId] = RemoteData.Loading
      })

      return [
        modelNew,
        pipe(
          findOneById({ conversationId }),
          Cmd.fromTask(
            (result): Msg => ["FindOneResulted", { conversationId, result }],
          ),
        ),
      ]
    }

    case "FindManyByUserId": {
      const { userId } = action[1]

      const query =
        model.queries.Conversation.FindManyByUserId[userId] ??
        RemoteData.NotAsked

      if (query.type === "Success") {
        return [model, Cmd.None]
      }

      const modelNew = produce(model, (model) => {
        model.queries.Conversation.FindManyByUserId[userId] = RemoteData.Loading
      })

      return [
        modelNew,
        pipe(
          findManyByUserId({ userId }),
          Cmd.fromTask(
            (result): Msg => ["FindManyByUserIdResulted", { userId, result }],
          ),
        ),
      ]
    }

    case "FindOneElseInsert": {
      const { userIds } = action[1]

      const modelNew = produce(model, (model) => {
        model.mutations.Conversation.FindElseInsert = RemoteData.Loading
      })

      return [
        modelNew,
        pipe(
          findOneElseInsert({ userIds }),
          Cmd.fromTask(
            (result): Msg => ["FindOneElseInsertResulted", { userIds, result }],
          ),
        ),
      ]
    }
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
  messages: Message[]
} => {
  const profiles = Object.values(store.ProfilesConversations)
    .filter((row) => row.conversationId === conversationId)
    .map((item) => store.Profile[item.userId])
    .flatMap((item) => (item ? [item] : []))

  const messages = Object.values(store.Message).filter(
    (item) => item.conversationId === conversationId,
  )

  return {
    conversationId: conversationId,
    profiles,
    messages,
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

const findOneById =
  ({ conversationId }: { conversationId: string }): Task.Task<FindOneResult> =>
  async () => {
    const matchConversationIdResponse = await Supabase.client
      .from<definitions["users_conversations"]>("users_conversations")
      .select("*")
      .eq("conversation_id", conversationId)

    if (matchConversationIdResponse.error) {
      return Result.Err(matchConversationIdResponse.error.message)
    }

    const userIds = Array.from(
      new Set(matchConversationIdResponse.data.map((item) => item.user_id)),
    )

    const profilesResponse = await Supabase.client
      .from<definitions["user_profile"]>("user_profile")
      .select("*")
      .in("id", userIds)

    if (profilesResponse.error) {
      return Result.Err(profilesResponse.error.message)
    }

    const messagesResponse = await Supabase.client
      .from<definitions["message"]>("message")
      .select("*")
      .eq("conversation_id", conversationId)

    if (messagesResponse.error) {
      return Result.Err(messagesResponse.error.message)
    }

    return Result.Ok({
      conversation: {
        conversationId,
      },
      profilesConversations: profilesResponse.data
        .map((item) => ({
          conversationId,
          userId: UserId.decode(item.id),
        }))
        .flatMap((item) =>
          item.userId.type === "Ok"
            ? [{ ...item, userId: item.userId.value }]
            : [],
        ),
      profiles: pipe(
        profilesResponse.data.map(decodeRow),
        Result.combine,
        Result.withDefault<Profile[]>([]),
      ),
      messages: messagesResponse.data
        .map((item) => ({
          messageId: item.id,
          message: item.message,
          userId: UserId.decode(item.user_id),
          conversationId: item.conversation_id,
        }))
        .flatMap((item) =>
          item.userId.type === "Ok"
            ? [{ ...item, userId: item.userId.value }]
            : [],
        ),
    })
  }

const findManyByUserId =
  ({
    userId,
  }: {
    userId: UserId.UserId
  }): Task.Task<
    Result.Result<
      Problem,
      {
        conversations: Conversation[]
        profiles: Profile[]
        profilesConversations: ProfilesConversations[]
      }
    >
  > =>
  async () => {
    const matchUserIdResponse = await Supabase.client
      .from<definitions["users_conversations"]>("users_conversations")
      .select("*")
      .match({ user_id: userId })

    if (matchUserIdResponse.error) {
      return Result.Err(matchUserIdResponse.error.message)
    }

    const conversationResponse = await Supabase.client
      .from<definitions["conversation"]>("conversation")
      .select("*")
      .in(
        "id",
        matchUserIdResponse.data.map((item) => item.conversation_id),
      )

    if (conversationResponse.error) {
      return Result.Err(conversationResponse.error.message)
    }

    const matchConversationIdResponse = await Supabase.client
      .from<definitions["users_conversations"]>("users_conversations")
      .select("*")
      .in(
        "conversation_id",
        conversationResponse.data.map((item) => item.id),
      )

    if (matchConversationIdResponse.error) {
      return Result.Err(matchConversationIdResponse.error.message)
    }

    const profileResponse = await Supabase.client
      .from<definitions["user_profile"]>("user_profile")
      .select("*")
      .in("id", [
        ...new Set(
          matchConversationIdResponse.data.map((item) => item.user_id),
        ),
      ])

    if (profileResponse.error) {
      return Result.Err(profileResponse.error.message)
    }

    return Result.Ok({
      profilesConversations: [
        ...matchUserIdResponse.data,
        ...matchConversationIdResponse.data,
      ]
        .map((item) => ({
          userId: UserId.decode(item.user_id),
          conversationId: item.conversation_id,
        }))
        .flatMap((item) =>
          item.userId.type === "Ok"
            ? [{ ...item, userId: item.userId.value }]
            : [],
        ),
      conversations: conversationResponse.data.map((item) => ({
        conversationId: item.id,
      })),
      profiles: pipe(
        profileResponse.data.map(decodeRow),
        Result.combine,
        Result.withDefault<Profile[]>([]),
      ),
    })
  }

const findUniqueByUserIds =
  ({
    userIds,
  }: {
    userIds: string[]
  }): Task.Task<Result.Result<Problem, Option.Option<string>>> =>
  async () => {
    const usersConversationsResponse = await Supabase.client
      .from<definitions["users_conversations"]>("users_conversations")
      .select("*")
      .in("user_id", userIds)

    if (usersConversationsResponse.error) {
      return Result.Err(usersConversationsResponse.error.message)
    }

    // todo. this should be in the database query
    const userIdsByConversationId = usersConversationsResponse.data.reduce<{
      [conversationId: string]: { [userId: UserId.UserId]: string }
    }>(
      (byId, item) => ({
        ...byId,
        [item.conversation_id]: {
          ...(byId[item.conversation_id] ?? {}),
          [item.user_id]: item.user_id,
        },
      }),
      {},
    )

    const conversationId = Object.entries(userIdsByConversationId)
      .filter(
        (entry) =>
          userIds.every((userId) => userId in entry[1]) &&
          userIds.length === Object.values(entry[1]).length,
      )
      .map((entry) => entry[0])[0]

    return Result.Ok(Option.fromNullable(conversationId))
  }

const findOneElseInsert =
  ({ userIds }: { userIds: string[] }): Task.Task<FindOneResult> =>
  async () => {
    const findIdResult = await findUniqueByUserIds({ userIds })()

    if (findIdResult.type === "Err") {
      return findIdResult
    }
    if (findIdResult.value.type === "None") {
      const insertResult = await insert({ userIds })()

      if (insertResult.type === "Err") {
        return insertResult
      }

      const conversationId = insertResult.value.conversation.conversationId

      return findOneById({ conversationId })()
    }

    const conversationId = findIdResult.value.value

    return findOneById({ conversationId })()
  }

const insert =
  ({
    userIds,
  }: {
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
    const conversationResponse = await Supabase.client
      .from<definitions["conversation"]>("conversation")
      .insert({})
      .single()

    console.log({ conversationResponse })
    if (conversationResponse.error) {
      return Result.Err(conversationResponse.error.message)
    }

    const conversation = fromRow(conversationResponse.data)

    const usersConversationsResponse = await Supabase.client
      .from<definitions["users_conversations"]>("users_conversations")
      .insert(
        userIds.map((userId) => ({
          conversation_id: conversation.conversationId,
          user_id: userId,
        })),
      )

    if (usersConversationsResponse.error) {
      const rollbackResponse = await Supabase.client
        .from<definitions["conversation"]>("conversation")
        .delete()
        .eq("id", conversation.conversationId)

      if (rollbackResponse.error) {
        return Result.Err(
          `${usersConversationsResponse.error.message}. ${rollbackResponse.error}`,
        )
      }

      return Result.Err(usersConversationsResponse.error.message)
    }

    const profilesConversations = usersConversationsResponse.data
      .map(({ user_id, conversation_id }) => ({
        userId: UserId.decode(user_id),
        conversationId: conversation_id,
      }))
      .flatMap((item) =>
        item.userId.type === "Ok"
          ? [{ ...item, userId: item.userId.value }]
          : [],
      )

    return Result.Ok({ conversation, profilesConversations })
  }
