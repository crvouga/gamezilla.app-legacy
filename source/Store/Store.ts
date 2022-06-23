import { pipe } from "fp-ts/lib/function"
import { cmd } from "Core"
import { Cmd } from "Core/Cmd"
import * as RemoteData from "Core/RemoteData"
import { perform } from "Core/Task"
import { sort, ascend, editDistance, exhaustive } from "Utility"
import * as Snackbar from "Snackbar"
import * as Conversation from "./Conversation"
import * as Profile from "./Profile"
import { matchSorter } from "match-sorter"
//
//
//
// Model
//
//
//

export type Model = {
  profile: {
    [id: string]: ProfileModel
  }
  conversation: {
    [id: string]: ConversationModel
  }
  profiles_conversations: {
    [id: string]: ProfilesConversationsModel
  }
  queries: { [id: string]: Query }
}

export type ProfileModel = RemoteData.RemoteData<Problem, Profile.Profile>

export type ConversationModel = RemoteData.RemoteData<
  Problem,
  Conversation.Conversation
>

export type ProfilesConversationsModel = RemoteData.RemoteData<
  Problem,
  ProfilesConversations
>

type ProfilesConversations = { userId: string; conversationId: string }

type Query =
  | {
      type: "Profile/Search"
      id: string
      searchText: string
      query: RemoteData.RemoteData<Problem, string[]>
    }
  | {
      type: "Profile/Get"
      id: string
      userId: string
      query: RemoteData.RemoteData<Problem, string>
    }

//
//
//

type Problem = { message: string }

//
//
//
// Init
//
//
//

export const init: Model = {
  profile: {},
  conversation: {},
  profiles_conversations: {},
  queries: {},
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

    case "Profile/Edit":
      const remoteDataProfile = toProfile(msg.userId, model)

      switch (remoteDataProfile.type) {
        case "Success":
          const prev = remoteDataProfile.value
          const next = { ...prev, ...msg.edits }
          return [
            mapProfile(
              msg.userId,
              RemoteData.map(() => next),
              model,
            ),
            pipe(
              Profile.edit(msg.userId, msg.edits),
              perform((result) => Profile.Edited(msg.userId, prev, result)),
            ),
            [],
          ]

        default:
          return [model, cmd.none, []]
      }

    case "Profile/Edited":
      const result = msg.result

      switch (result.type) {
        case "Err":
          return [
            mapProfile(
              msg.userId,
              RemoteData.map(() => msg.previous),
              model,
            ),
            cmd.none,
            [],
          ]

        case "Ok":
          return [model, cmd.none, []]
      }

    case "Profile/Get":
      return [
        {
          ...mapProfile(msg.userId, () => RemoteData.Loading, model),
          queries: {
            ...model.queries,
            [`Profile/Get/${msg.userId}`]: {
              type: "Profile/Get",
              userId: msg.userId,
              query: RemoteData.Loading,
            },
          },
        },
        getProfile(msg.userId),
        [],
      ]

    case "Profile/Got":
      return [
        mapProfile(msg.userId, () => RemoteData.fromResult(msg.result), model),
        cmd.none,
        [],
      ]

    case "Profile/DeleteForever": {
      const remoteDataProfile = toProfile(msg.userId, model)

      switch (remoteDataProfile.type) {
        case "Success":
          const previous = remoteDataProfile.value

          return [
            mapProfile(msg.userId, () => RemoteData.NotAsked, model),
            pipe(
              Profile.deleteForever(msg.userId),
              perform((result) =>
                Profile.DeletedForever(msg.userId, previous, result),
              ),
            ),
            [],
          ]

        default:
          return [model, cmd.none, []]
      }
    }

    case "Profile/DeletedForever": {
      const result = msg.result

      switch (result.type) {
        case "Err":
          return [
            mapProfile(
              msg.userId,
              () => RemoteData.Success(msg.previous),
              model,
            ),
            cmd.none,
            [],
          ]

        case "Ok":
          return [
            mapProfile(msg.userId, () => RemoteData.NotAsked, model),
            getProfile(msg.userId),
            [],
          ]
      }
    }

    case "Profile/Create":
      return [
        mapProfile(msg.profile.userId, () => RemoteData.Loading, model),
        pipe(
          Profile.create(msg.profile),
          perform((result) => Profile.Created(msg.profile.userId, result)),
        ),
        [],
      ]

    case "Profile/Created": {
      const { result } = msg

      switch (result.type) {
        case "Err":
          return [
            mapProfile(
              msg.userId,
              () => RemoteData.Failure(result.error),
              model,
            ),
            cmd.none,
            [Snackbar.EnqueuedSnackbarError(result.error.message)],
          ]

        case "Ok":
          return [
            mapProfile(
              msg.userId,
              () => RemoteData.Success(result.value),
              model,
            ),
            cmd.none,
            [],
          ]
      }
    }

    case "Profile/Search":
      return [
        model,
        pipe(
          Profile.search({ nameOrUsername: msg.searchText }),
          perform((result) => Profile.Searched(result)),
        ),
        [],
      ]

    case "Profile/Searched": {
      const { result } = msg

      switch (result.type) {
        case "Err":
          return [model, cmd.none, []]

        case "Ok":
          const profilesById = result.value.reduce<Model["profile"]>(
            (byId, profile) => ({
              ...byId,
              [profile.userId]: RemoteData.Success({
                ...(byId?.[profile.userId] ?? {}),
                ...profile,
              }),
            }),
            {},
          )

          return [
            { ...model, profile: { ...model.profile, ...profilesById } },
            cmd.none,
            [],
          ]
      }
    }

    default:
      return exhaustive(msg)
  }
}

const getProfile = (userId: string) => {
  return pipe(
    Profile.load({ userId }),
    perform((result) => Profile.Got(userId, result)),
  )
}

//
//
//
//
//
//
//

const mapProfile = (
  userId: string,
  mapper: (remoteDataProfile: ProfileModel) => ProfileModel,
  model: Model,
): Model => {
  return {
    ...model,
    profile: {
      ...model.profile,
      [userId]: mapper(toProfile(userId, model)),
    },
  }
}

export const toProfile = (userId: string, model: Model): ProfileModel => {
  return model.profile[userId] ?? RemoteData.NotAsked
}

export const searchProfiles = (nameOrUsername: string, store: Model) => {
  return pipe(
    store,

    (store) => Object.values(store.profile),

    (profiles) =>
      profiles.reduce<Profile.Profile[]>(
        (profiles, p) =>
          p.type === "Success" ? [...profiles, p.value] : profiles,
        [],
      ),

    (profiles) =>
      matchSorter(profiles, nameOrUsername, { keys: ["name", "username"] }),
    // sort(
    //   ascend((profile) =>
    //     Math.min(
    //       editDistance(profile.name, nameOrUsername),
    //       editDistance(profile.username, nameOrUsername)
    //     )
    //   ),
    //   profiles
    // )
  )
}
