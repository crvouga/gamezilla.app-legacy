import { cmd } from "Core"
import { Cmd } from "Core/Cmd"
import * as RemoteData from "Core/RemoteData"
import * as Result from "Core/Result"
import { perform } from "Core/Task"
import { pipe } from "fp-ts/lib/function"
import { matchSorter } from "match-sorter"
import * as Snackbar from "Snackbar"
import { exhaustive } from "Utility"
import * as Conversation from "./Conversation"
import * as Profile from "./Profile"
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
    [id: string]: {
      id: string
      userId: string
      conversationId: string
    }
  }
  queries: {
    [id: string]: Query
  }
  mutations: {
    [id: string]: Mutation
  }
}

type Mutation =
  | (RemoteData.RemoteData<Problem, string> & { tag: "Profile/DeleteForever" })
  | (RemoteData.RemoteData<Problem, string> & { tag: "Profile/Edit" })

const toProfileEditMutationId = (userId: string) =>
  ["Profile", "Edit", userId].join("/")

const toProfileDeleteForeverMutationId = (userId: string) =>
  ["Profile", "DeleteForever", userId].join("/")

type Query =
  | (RemoteData.RemoteData<Problem, string> & { tag: "Profile/Get" })
  | (RemoteData.RemoteData<Problem, string[]> & { tag: "Profile/Search" })

const toProfileGetQueryId = (userId: string) =>
  ["Profile", "Get", userId].join("/")

const toProfileSearchQueryId = (searchText: string) =>
  ["Profile", "Search", searchText].join("/")

type Problem = { message: string }

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

type Action = Snackbar.GroupedMsg

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>, Action[]] => {
  switch (msg.type) {
    case "Conversation/Create":
      return [model, cmd.none, []]

    case "Conversation/Created":
      return [model, cmd.none, []]

    case "Profile/Edit": {
      const { userId, edits } = msg
      const query = toProfileGetQuery(userId, model)

      if (query.type !== "Success") {
        return [model, cmd.none, []]
      }
      const mutationId = toProfileEditMutationId(userId)
      const mutationsNew: Model["mutations"] = {
        ...model.mutations,
        [mutationId]: {
          tag: "Profile/Edit",
          ...RemoteData.Loading,
        },
      }

      const ProfileNew = {
        ...model.Profile,
        [userId]: { ...query.value, ...edits },
      }

      return [
        { ...model, Profile: ProfileNew, mutations: mutationsNew },
        pipe(
          Profile.edit(msg.userId, msg.edits),
          perform((result) => Profile.Edited(msg.userId, query.value, result)),
        ),
        [],
      ]
    }

    case "Profile/Edited": {
      const { result, userId } = msg

      const mutationId = toProfileEditMutationId(userId)
      const mutationsNew: Model["mutations"] = {
        ...model.mutations,
        [mutationId]: {
          ...pipe(
            result,
            RemoteData.fromResult,
            RemoteData.map((profile) => profile.userId),
          ),
          tag: "Profile/Edit",
        },
      }

      switch (result.type) {
        case "Err": {
          const ProfileNew = removeKey(userId, model.Profile)
          return [
            { ...model, Profile: ProfileNew, mutations: mutationsNew },
            cmd.none,
            [],
          ]
        }

        case "Ok": {
          const ProfileNew = {
            ...model.Profile,
            [result.value.userId]: result.value,
          }
          return [
            { ...model, Profile: ProfileNew, mutations: mutationsNew },
            cmd.none,
            [],
          ]
        }
      }
    }

    case "Profile/Get": {
      const { userId } = msg
      const query = toProfileGetQuery(userId, model)

      if (query.type === "Loading") {
        return [model, cmd.none, []]
      }

      const queryId = toProfileGetQueryId(userId)

      const queriesNew: Model["queries"] = {
        ...model.queries,
        [queryId]: {
          tag: "Profile/Get",
          ...RemoteData.Loading,
        },
      }

      return [
        { ...model, queries: queriesNew },
        pipe(
          Profile.load({ userId }),
          perform((result) => Profile.Got(userId, result)),
        ),
        [],
      ]
    }

    case "Profile/Got": {
      const modelNew = updateGotProfile(msg.userId, msg.result, model)
      return [modelNew, cmd.none, []]
    }

    case "Profile/DeleteForever": {
      const query = toProfileGetQuery(msg.userId, model)

      if (query.type !== "Success") {
        return [model, cmd.none, []]
      }

      const modelNew = updateGotProfile(
        msg.userId,
        Result.Err({ message: "Profile was deleted" }),
        model,
      )

      return [
        modelNew,
        pipe(
          Profile.deleteForever(msg.userId),
          perform((result) =>
            Profile.DeletedForever(msg.userId, query.value, result),
          ),
        ),
        [],
      ]
    }

    case "Profile/DeletedForever": {
      const { result, userId, previous } = msg

      switch (result.type) {
        case "Err": {
          const ProfileNew = { ...model.Profile, [userId]: previous }
          return [{ ...model, Profile: ProfileNew }, cmd.none, []]
        }

        case "Ok": {
          return [model, cmd.none, []]
        }
      }
    }

    case "Profile/Create":
      const modelNew = updateGotProfile(
        msg.profile.userId,
        Result.Ok(msg.profile),
        model,
      )

      return [
        modelNew,
        pipe(
          Profile.create(msg.profile),
          perform((result) => Profile.Created(msg.profile.userId, result)),
        ),
        [],
      ]

    case "Profile/Created": {
      const modelNew = updateGotProfile(msg.userId, msg.result, model)

      return [modelNew, cmd.none, []]
    }

    case "Profile/Search":
      const nameOrUsername = msg.searchText
      const queryId = toProfileSearchQueryId(nameOrUsername)
      const queriesNew: Model["queries"] = {
        ...model.queries,
        [queryId]: {
          tag: "Profile/Search",
          ...RemoteData.Loading,
        },
      }
      return [
        { ...model, queries: queriesNew },
        pipe(
          Profile.search({ nameOrUsername }),
          perform((result) => Profile.Searched(nameOrUsername, result)),
        ),
        [],
      ]

    case "Profile/Searched": {
      const { result } = msg

      switch (result.type) {
        case "Err":
          return [model, cmd.none, []]

        case "Ok":
          const ProfileNew = result.value.reduce<Model["Profile"]>(
            (Profile, profile) => ({
              ...Profile,
              [profile.userId]: {
                ...(Profile?.[profile.userId] ?? {}),
                ...profile,
              },
            }),
            model.Profile,
          )

          const queryId = toProfileSearchQueryId(msg.searchText)
          const queriesNew: Model["queries"] = {
            ...model.queries,
            [queryId]: {
              ...RemoteData.Success(
                result.value.map((profile) => profile.userId),
              ),
              tag: "Profile/Search",
            },
          }

          return [
            {
              ...model,
              queries: queriesNew,
              Profile: ProfileNew,
            },
            cmd.none,
            [],
          ]
      }
    }

    default:
      return exhaustive(msg)
  }
}

const updateGotProfile = (
  userId: string,
  result: Result.Result<Problem, Profile.Profile>,
  model: Model,
): Model => {
  const queryId = toProfileGetQueryId(userId)

  const queriesNew: Model["queries"] = {
    ...model.queries,
    [queryId]: {
      tag: "Profile/Get",
      ...pipe(
        result,
        RemoteData.fromResult,
        RemoteData.map((profile) => profile.userId),
      ),
    },
  }

  switch (result.type) {
    case "Err": {
      return {
        ...model,
        Profile: removeKey(userId, model.Profile),
        queries: queriesNew,
      }
    }

    case "Ok": {
      const ProfileNew = {
        ...model.Profile,
        [result.value.userId]: result.value,
      }

      return {
        ...model,
        Profile: ProfileNew,
        queries: queriesNew,
      }
    }
  }
}

//
//
//
//
//
//
//

export const toProfileGetQuery = (
  userId: string,
  model: Model,
): RemoteData.RemoteData<Problem, Profile.Profile> => {
  const query = model.queries[toProfileGetQueryId(userId)]

  if (!query) {
    return RemoteData.NotAsked
  }

  if (query.tag !== "Profile/Get") {
    return RemoteData.NotAsked
  }

  switch (query.type) {
    case "Failure":
    case "Loading":
    case "NotAsked":
      return query
    case "Success":
      const userId = query.value
      const profile = model.Profile[userId]
      if (!profile) {
        return RemoteData.Failure({ message: "Not present" })
      }

      return RemoteData.Success(profile)
  }
}

export const searchProfiles = (nameOrUsername: string, store: Model) => {
  return pipe(
    store,
    (store) => Object.values(store.Profile),
    (profiles) =>
      matchSorter(profiles, nameOrUsername, { keys: ["name", "username"] }),
  )
}

//
//
//
// Helpers
//
//
//

const removeKey = <T>(key: keyof T, record: T): Omit<T, keyof T> => {
  const { [key]: _value, ...removed } = record

  return removed
}
