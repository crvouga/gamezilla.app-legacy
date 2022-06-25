import * as Snackbar from "Snackbar"
import * as Rx from "rxjs"
import { Cmd, RemoteData, Result, Task } from "Core"
import { exhaustive } from "Utility"
import { pipe } from "fp-ts/lib/function"
import { matchSorter } from "match-sorter"
import * as Supabase from "../Supabase"
import * as Store from "./Store"
import { Sub } from "../Core"
import { definitions } from "../supabase-types"

//
//
//
// Model
//
//
//

type Model = Store.Model

export type Profile = {
  userId: string
  username: string
  name: string
  avatarUrl: string
  themeMode: ThemeMode
}

export type ThemeMode = "Light" | "Dark" | "System"

export type Mutation =
  | (RemoteData.RemoteData<Problem, string> & { tag: "Profile/DeleteForever" })
  | (RemoteData.RemoteData<Problem, string> & { tag: "Profile/Edit" })
  | (RemoteData.RemoteData<Problem, string> & { tag: "Profile/Create" })

export type Query =
  | (RemoteData.RemoteData<Problem, string> & { tag: "Profile/Get" })
  | (RemoteData.RemoteData<Problem, string[]> & { tag: "Profile/Search" })

const toGetId = (userId: string) => ["Profile", "Get", userId].join("/")

const toSearchId = (searchText: string) =>
  ["Profile", "Search", searchText].join("/")

export const toEditId = (userId: string) =>
  ["Profile", "Edit", userId].join("/")

export const toDeleteId = (userId: string) =>
  ["Profile", "DeleteForever", userId].join("/")

type Problem = { message: string }

//
//
//
// Msg
//
//
//

export const Edit = (userId: string, edits: Partial<Profile>) =>
  ({
    group: "Store",
    entity: "Profile",
    type: "Profile/Edit",
    userId,
    edits,
  } as const)

export type Edit = ReturnType<typeof Edit>

export const Edited = (
  userId: string,
  previous: Profile,
  result: Result.Result<Problem, Profile>,
) =>
  ({
    group: "Store",
    type: "Profile/Edited",
    entity: "Profile",
    result,
    userId,
    previous,
  } as const)

export type Edited = ReturnType<typeof Edited>

export const Get = (userId: string) => {
  return {
    group: "Store",
    type: "Profile/Get",
    entity: "Profile",
    userId,
  } as const
}

export type Get = ReturnType<typeof Get>

export const Got = (
  userId: string,
  result: Result.Result<Problem, Profile>,
) => {
  return {
    group: "Store",
    type: "Profile/Got",
    entity: "Profile",
    userId,
    result,
  } as const
}

export type Got = ReturnType<typeof Got>

export const DeleteForever = (userId: string) => {
  return {
    group: "Store",
    type: "Profile/DeleteForever",
    entity: "Profile",
    userId,
  } as const
}

export type DeleteForever = ReturnType<typeof DeleteForever>

export const DeletedForever = (
  userId: string,
  previous: Profile,
  result: Result.Result<Problem, {}>,
) => {
  return {
    group: "Store",
    entity: "Profile",
    type: "Profile/DeletedForever",
    userId,
    previous,
    result,
  } as const
}

export type DeletedForever = ReturnType<typeof DeletedForever>

export const Create = (
  userId: string,
  {
    username,
    name,
    avatarUrl,
  }: {
    username: string
    name: string
    avatarUrl: string
  },
) => {
  const profile: Profile = {
    username,
    name,
    avatarUrl,
    themeMode: "System",
    userId,
  }

  return {
    group: "Store",
    entity: "Profile",
    type: "Profile/Create",
    profile,
  } as const
}

export type Create = ReturnType<typeof Create>

export const Created = (
  userId: string,
  result: Result.Result<Problem, Profile>,
) => {
  return {
    group: "Store",
    entity: "Profile",
    type: "Profile/Created",
    userId,
    result,
  } as const
}

export type Created = ReturnType<typeof Created>

export const Search = (searchText: string) => {
  return {
    group: "Store",
    entity: "Profile",
    type: "Profile/Search",
    searchText,
  } as const
}

export type Search = ReturnType<typeof Search>

export const Searched = (
  searchText: string,
  result: Result.Result<Problem, Profile[]>,
) => {
  return {
    group: "Store",
    entity: "Profile",
    type: "Profile/Searched",
    result,
    searchText,
  } as const
}

export type Searched = ReturnType<typeof Searched>

export const Received = (profile: Profile) => {
  return {
    entity: "Profile",
    group: "Store",
    type: "Profile/Received",
    profile,
  } as const
}

export type Received = ReturnType<typeof Received>

export type Msg =
  | Edited
  | Edit
  | Get
  | Got
  | DeleteForever
  | DeletedForever
  | Create
  | Created
  | Search
  | Searched
  | Received

//
//
//
// Update
//
//
//

type Action = Snackbar.GroupedMsg

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, Action[]] => {
  switch (msg.type) {
    case "Profile/Received":
      const ProfileNew = {
        ...model.Profile,
        [msg.profile.userId]: {
          ...(model.Profile[msg.profile.userId] ?? {}),
          ...msg.profile,
        },
      }
      return [{ ...model, Profile: ProfileNew }, Cmd.none, []]

    case "Profile/Edit": {
      const { userId, edits } = msg
      const query = toGetQuery(userId, model)

      if (query.type !== "Success") {
        return [model, Cmd.none, []]
      }
      const mutationId = toEditId(userId)
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
          edit(msg.userId, msg.edits),
          Cmd.fromTask((result) => Edited(msg.userId, query.value, result)),
        ),
        [],
      ]
    }

    case "Profile/Edited": {
      const { result, userId } = msg

      const mutationId = toEditId(userId)
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
            Cmd.none,
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
            Cmd.none,
            [],
          ]
        }
      }
    }

    case "Profile/Get": {
      const { userId } = msg
      const query = toGetQuery(userId, model)

      if (query.type === "Loading") {
        return [model, Cmd.none, []]
      }

      const queryId = toGetId(userId)

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
          load({ userId }),
          Cmd.fromTask((result) => Got(userId, result)),
        ),
        [],
      ]
    }

    case "Profile/Got": {
      const modelNew = updateGotProfile(msg.userId, msg.result, model)
      return [modelNew, Cmd.none, []]
    }

    case "Profile/DeleteForever": {
      const query = toGetQuery(msg.userId, model)

      if (query.type !== "Success") {
        return [model, Cmd.none, []]
      }

      const modelNew = updateGotProfile(
        msg.userId,
        Result.Err({ message: "Profile was deleted" }),
        model,
      )

      return [
        modelNew,
        pipe(
          deleteForever(msg.userId),
          Cmd.fromTask((result) =>
            DeletedForever(msg.userId, query.value, result),
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
          return [{ ...model, Profile: ProfileNew }, Cmd.none, []]
        }

        case "Ok": {
          return [model, Cmd.none, []]
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
          create(msg.profile),
          Cmd.fromTask((result) => Created(msg.profile.userId, result)),
        ),
        [],
      ]

    case "Profile/Created": {
      const modelNew = updateGotProfile(msg.userId, msg.result, model)

      return [modelNew, Cmd.none, []]
    }

    case "Profile/Search":
      const nameOrUsername = msg.searchText
      const queryId = toSearchId(nameOrUsername)
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
          search({ nameOrUsername }),
          Cmd.fromTask((result) => Searched(nameOrUsername, result)),
        ),
        [],
      ]

    case "Profile/Searched": {
      const { result } = msg

      switch (result.type) {
        case "Err":
          return [model, Cmd.none, []]

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

          const queryId = toSearchId(msg.searchText)
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
            Cmd.none,
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
  result: Result.Result<Problem, Profile>,
  model: Model,
): Model => {
  const queryId = toGetId(userId)

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
// Selectors
//
//
//

export const toGetQuery = (
  userId: string,
  model: Model,
): RemoteData.RemoteData<Problem, Profile> => {
  const query = model.queries[toGetId(userId)]

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

export const toSearchQuery = (
  searchText: string,
  model: Model,
): RemoteData.RemoteData<Problem, string[]> => {
  const query = model.queries[toSearchId(searchText)]

  if (!query) {
    return RemoteData.NotAsked
  }

  if (query.tag !== "Profile/Search") {
    return RemoteData.NotAsked
  }

  return query
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
// Data Access
//
//
//

const toThemeMode = (
  themeMode: definitions["profile"]["theme_mode"],
): ThemeMode => {
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
  themeMode: ThemeMode,
): definitions["profile"]["theme_mode"] => {
  switch (themeMode) {
    case "Dark":
      return "DARK"

    case "Light":
      return "LIGHT"

    case "System":
      return "SYSTEM"
  }
}

const rowToProfile = (row: definitions["profile"]): Profile => {
  return {
    userId: row.id,
    avatarUrl: row.avatar_url,
    name: row.name,
    username: row.username,
    themeMode: toThemeMode(row.theme_mode),
  }
}

export const load =
  ({
    userId,
  }: {
    userId: string
  }): Task.Task<Result.Result<Problem, Profile>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["profile"]>("profile")
      .select("*")
      .eq("id", userId)
      .single()

    if (response.error) {
      return Result.Err({ message: response.error.message })
    }

    return Result.Ok(rowToProfile(response.data))
  }

export const create =
  ({
    userId,
    name,
    username,
    avatarUrl,
  }: {
    userId: string
    name: string
    username: string
    avatarUrl: string
  }): Task.Task<Result.Result<Problem, Profile>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["profile"]>("profile")
      .insert({
        id: userId,
        name,
        username,
        avatar_url: avatarUrl,
        theme_mode: "SYSTEM",
      })
      .single()

    if (response.data) {
      return Result.Ok(rowToProfile(response.data))
    }

    return Result.Err({ message: response.error.message })
  }

export const deleteForever =
  (userId: string): Task.Task<Result.Result<Problem, {}>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["profile"]>("profile")
      .delete()
      .match({ id: userId })

    if (response.error) {
      return Result.Err({ message: response.error.message })
    }

    return Result.Ok({})
  }

export const search =
  ({
    nameOrUsername,
  }: {
    nameOrUsername: string
  }): Task.Task<Result.Result<Problem, Profile[]>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["profile"]>("profile")
      .select("*")
      .ilike(
        "name",
        `%${nameOrUsername
          .split(" ")
          .map((_) => _.replace(" ", ""))
          .join("%")}%`,
      )

    if (response.error) {
      return Result.Err({ message: response.error.message })
    }

    const profiles = response.data.map(rowToProfile)

    return Result.Ok(profiles)
  }

export const edit =
  (
    userId: string,
    edits: Partial<Profile>,
  ): Task.Task<Result.Result<Problem, Profile>> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["profile"]>("profile")
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
      return Result.Err({ message: response.error.message })
    }

    return Result.Ok(rowToProfile(response.data))
  }

export const subscriptions = ({ userId }: { userId: string }): Sub.Sub<Msg> => {
  return new Rx.Observable<Msg>((subscriber) => {
    const subscription = Supabase.client
      .from<definitions["profile"]>(`profile:id=eq.${userId}`)
      .on("INSERT", (payload) => {
        const profile = rowToProfile(payload.new)
        subscriber.next(Received(profile))
      })
      .on("UPDATE", (payload) => {
        const profile = rowToProfile(payload.new)
        subscriber.next(Received(profile))
      })
      .on("DELETE", () => {
        // todo
      })
      .subscribe()

    return () => {
      Supabase.client.removeSubscription(subscription)
      subscription.unsubscribe()
    }
  })
}

//
//
//
// Helpers
//
//
//

const removeKey = <T,>(key: keyof T, record: T): Omit<T, keyof T> => {
  const { [key]: _value, ...removed } = record

  return removed
}
