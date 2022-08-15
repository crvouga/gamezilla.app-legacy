import produce from "immer"
import { matchSorter } from "match-sorter"
import { Cmd, exhaustive, pipe, RemoteData, Result, Task, Unit } from "../Core"
import { UserId, Username } from "../Data"
import * as Supabase from "../Supabase"
import { definitions } from "../Supabase.Types"
import * as Types from "./Types"
import { Problem, Store } from "./Types"

//
//
//
// Model
//
//
//

type Model = Store

export type Profile = Types.Profile

//
//
//
// Msg
//
//
//

export type FindMany = ["FindMany", { userIds: UserId.UserId[] }]
export type FindManyResulted = [
  "FindManyResulted",
  { userIds: UserId.UserId[]; result: Result.Result<Problem, Profile[]> },
]

export type Edit = ["Edit", { userId: UserId.UserId; edits: Partial<Profile> }]
export type EditResulted = [
  "EditResulted",
  {
    userId: UserId.UserId
    previous: Profile
    result: Result.Result<Problem, Profile>
  },
]

export type DeleteForever = ["DeleteForever", { userId: UserId.UserId }]
export type DeleteForeverResulted = [
  "DeleteForeverResulted",
  { userId: UserId.UserId; result: Result.Result<Problem, Unit> },
]

export type Create = ["Create", { profile: Profile; userId: UserId.UserId }]
export type CreateResulted = [
  "CreateResulted",
  { userId: UserId.UserId; result: Result.Result<Problem, Profile> },
]

export type Search = ["Search", { searchText: string }]
export type SearchResulted = [
  "SearchResulted",
  { searchText: string; result: Result.Result<Problem, Profile[]> },
]

export type ResetMutations = ["ResetMutations"]

export type Msg =
  | EditResulted
  | FindManyResulted
  | DeleteForeverResulted
  | CreateResulted
  | SearchResulted

export type Action =
  | Search
  | FindMany
  | DeleteForever
  | Edit
  | Create
  | ResetMutations

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "EditResulted": {
      const { userId, result } = msg[1]

      const modeNew = produce(model, (model) => {
        model.mutations.Profile.Edit[userId] = pipe(
          msg[1].result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((profile) => profile.userId),
        )

        switch (result.type) {
          case "Err":
            delete model.Profile[userId]
            break

          case "Ok":
            model.Profile[result.value.userId] = result.value
            break
        }
      })

      return [modeNew, Cmd.None]
    }

    case "FindManyResulted": {
      const { userIds, result } = msg[1]

      const key = Types.toFindManyKey(userIds)

      const modelNew = produce(model, (model) => {
        model.queries.Profile.FindMany[key] = pipe(
          result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((profiles) =>
            profiles.map((profile) => profile.userId),
          ),
        )

        if (result.type === "Ok") {
          for (const profile of result.value) {
            model.Profile[profile.userId] = profile
          }
        }
      })
      return [modelNew, Cmd.None]
    }

    case "DeleteForeverResulted": {
      const { result, userId } = msg[1]
      const modelNew = produce(model, (model) => {
        model.mutations.Profile.DeleteForever[userId] =
          RemoteData.fromResult(result)

        switch (result.type) {
          case "Err":
            break

          case "Ok":
            delete model.Profile[userId]
        }
      })
      return [modelNew, Cmd.None]
    }

    case "CreateResulted": {
      const { userId, result } = msg[1]

      const modelNew = produce(model, (model) => {
        model.mutations.Profile.Create[userId] = pipe(
          result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((profile) => profile.userId),
        )

        switch (result.type) {
          case "Err":
            delete model.Profile[userId]
            break

          case "Ok":
            model.Profile[userId] = result.value
            break
        }
      })

      return [modelNew, Cmd.None]
    }

    case "SearchResulted": {
      const { result, searchText } = msg[1]

      const modelNew = produce(model, (model) => {
        model.queries.Profile.Search[searchText] = pipe(
          result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((profiles) =>
            profiles.map((profile) => profile.userId),
          ),
        )

        switch (result.type) {
          case "Err":
            break

          case "Ok":
            for (const profile of result.value) {
              model.Profile[profile.userId] = profile
            }
            break
        }
      })

      return [modelNew, Cmd.None]
    }

    default:
      return exhaustive(msg)
  }
}

export const updateFromAction = (
  msg: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Edit": {
      const { userId, edits } = msg[1]

      const profile = model.Profile[userId]

      if (!profile) {
        return [model, Cmd.None]
      }

      const modelNew = produce(model, (model) => {
        model.mutations.Profile.Edit[userId] = RemoteData.Loading

        model.Profile[userId] = { ...profile, ...edits }
      })

      return [
        modelNew,
        pipe(
          edit(userId, edits),
          Cmd.perform(
            (result): Msg => [
              "EditResulted",
              { previous: profile, userId, result },
            ],
          ),
        ),
      ]
    }

    case "FindMany": {
      const { userIds } = msg[1]

      const modelNew = produce(model, (model) => {
        const key = Types.toFindManyKey(userIds)
        model.queries.Profile.FindMany[key] = RemoteData.Loading
      })

      return [
        modelNew,
        pipe(
          findMany({ userIds }),
          Cmd.perform(
            (result): Msg => ["FindManyResulted", { userIds, result }],
          ),
        ),
      ]
    }

    case "DeleteForever": {
      const { userId } = msg[1]

      const modelNew = produce(model, (model) => {
        model.mutations.Profile.DeleteForever[userId] = RemoteData.Loading
      })

      return [
        modelNew,
        pipe(
          deleteForever(userId),
          Cmd.perform(
            (result): Msg => ["DeleteForeverResulted", { userId, result }],
          ),
        ),
      ]
    }

    case "Create": {
      const { profile, userId } = msg[1]
      const modelNew = produce(model, (model) => {
        model.mutations.Profile.Create[userId] = RemoteData.Loading
        model.Profile[userId] = profile
      })

      return [
        modelNew,
        pipe(
          create(profile),
          Cmd.perform((result): Msg => ["CreateResulted", { userId, result }]),
        ),
      ]
    }

    case "Search": {
      const { searchText } = msg[1]

      const modelNew = produce(model, (model) => {
        model.queries.Profile.Search[searchText] = RemoteData.Loading
      })

      return [
        modelNew,
        pipe(
          search({ nameOrUsername: searchText }),
          Cmd.perform(
            (result): Msg => ["SearchResulted", { result, searchText }],
          ),
        ),
      ]
    }

    case "ResetMutations": {
      const modelNew = produce(model, (model) => {
        model.mutations.Profile = Types.initialStore.mutations.Profile
      })

      return [modelNew, Cmd.None]
    }

    default:
      return exhaustive(msg)
  }
}

//
//
//
// Selectors
//
//
//

// export const toProfile = (
//   userId: UserId.UserId,
//   model: Model,
// ): RemoteData.Model<Problem, Profile> => {

//   const key = Types.toFindManyKey([userId])

//   const query = model.queries.Profile.FindMany[key] ?? RemoteData.NotAsked

//   switch (query.type) {
//     case "Failure":
//     case "Loading":
//     case "NotAsked":
//       return query

//     case "Success":
//       const userId = query.value

//       const profile = model.Profile[userId]

//       if (!profile) {
//         return RemoteData.Failure("Invalid state")
//       }

//       return RemoteData.Success(profile)
//   }
// }

export const toSearch = (nameOrUsername: string, store: Model) => {
  return matchSorter(Object.values(store.Profile), nameOrUsername, {
    keys: ["name", "username"],
  })
}

//
//
//
// Data Access
//
//
//

export const rowThemeModeToThemeMode = (
  themeMode: definitions["user_profile"]["theme_mode"],
): Profile["themeMode"] => {
  switch (themeMode) {
    case "DARK":
      return "Dark"

    case "LIGHT":
      return "Light"

    case "SYSTEM":
      return "System"
  }
}

const fromThemeMode = (
  themeMode: Profile["themeMode"],
): definitions["user_profile"]["theme_mode"] => {
  switch (themeMode) {
    case "Dark":
      return "DARK"

    case "Light":
      return "LIGHT"

    case "System":
      return "SYSTEM"
  }
}

export const decodeRow = (
  row: definitions["user_profile"],
): Result.Result<string, Profile> => {
  const userId = UserId.decode(row.id)
  const username = Username.decode(row.username)

  if (userId.type === "Ok" && username.type === "Ok") {
    return Result.Ok({
      userId: userId.value,
      avatarUrl: row.avatar_url,
      name: row.name,
      username: username.value,
      themeMode: rowThemeModeToThemeMode(row.theme_mode),
    })
  }

  // todo better error
  return Result.Err("failed_to_decode_supabase_row")
}

export const findOne =
  ({
    userId,
  }: {
    userId: UserId.UserId
  }): Task.Task<Result.Result<string, Profile>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["user_profile"]>("user_profile")
      .select("*")
      .eq("id", userId)
      .single()

    if (response.error) {
      return Result.Err(response.error.message)
    }

    return decodeRow(response.data)
  }

export const findMany =
  ({
    userIds,
  }: {
    userIds: string[]
  }): Task.Task<Result.Result<string, Profile[]>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["user_profile"]>("user_profile")
      .select("*")
      .in("id", userIds)

    if (response.error) {
      return Result.Err(response.error.message)
    }

    const result = Result.combine(response.data.map(decodeRow))

    return result
  }

export const create =
  ({
    userId,
    name,
    username,
    avatarUrl,
  }: {
    userId: UserId.UserId
    name: string
    username: string
    avatarUrl: string
  }): Task.Task<Result.Result<string, Profile>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["user_profile"]>("user_profile")
      .insert({
        id: userId,
        name,
        username,
        avatar_url: avatarUrl,
        theme_mode: "SYSTEM",
      })
      .single()

    if (response.data) {
      return decodeRow(response.data)
    }

    return Result.Err(response.error.message)
  }

export const deleteForever =
  (userId: UserId.UserId): Task.Task<Result.Result<Problem, Unit>> =>
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await Supabase.client
      .from<definitions["user_profile"]>("user_profile")
      .delete()
      .match({ id: userId })

    if (response.error) {
      return Result.Err(response.error.message)
    }

    return Result.Ok(Unit)
  }

export const search =
  ({
    nameOrUsername,
  }: {
    nameOrUsername: string
  }): Task.Task<Result.Result<string, Profile[]>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["user_profile"]>("user_profile")
      .select("*")
      .ilike(
        "name",
        `%${nameOrUsername
          .split(" ")
          .map((_) => _.replace(" ", ""))
          .join("%")}%`,
      )

    if (response.error) {
      return Result.Err(response.error.message)
    }

    return Result.combine(response.data.map(decodeRow))
  }

export const edit =
  (
    userId: UserId.UserId,
    edits: Partial<Profile>,
  ): Task.Task<Result.Result<string, Profile>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["user_profile"]>("user_profile")
      .update({
        username: edits.username,
        name: edits.name,
        avatar_url: edits.avatarUrl,
        theme_mode: edits.themeMode
          ? fromThemeMode(edits.themeMode)
          : undefined,
      })
      .match({ id: userId })
      .single()

    if (response.error) {
      return Result.Err(response.error.message)
    }

    return decodeRow(response.data)
  }
