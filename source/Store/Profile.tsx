import * as Snackbar from "Snackbar"
import * as Rx from "rxjs"
import { Cmd, Option, RemoteData, Result, Task, pipe } from "Core"
import { exhaustive } from "Utility"
import produce from "immer"
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
  themeMode: "Light" | "Dark" | "System"
}

export type Queries = {
  Get: {
    [userId: string]: RemoteData.RemoteData<Problem, string>
  }
  Search: {
    [searchText: string]: RemoteData.RemoteData<Problem, string[]>
  }
}

export type Mutations = {
  Edit: {
    [userId: string]: RemoteData.RemoteData<Problem, string>
  }
  DeleteForever: {
    [userId: string]: RemoteData.RemoteData<Problem, string>
  }
  Create: {
    [userId: string]: RemoteData.RemoteData<Problem, string>
  }
}

type Problem = { message: string }

//
//
//
// Msg
//
//
//

export const ResetMutations = () => {
  return {
    entity: "Profile",
    group: "Store",
    type: "Profile/ResetMutations",
  } as const
}
export type ResetMutations = ReturnType<typeof ResetMutations>

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

export type Delete = ReturnType<typeof DeleteForever>

export const DeleteResulted = (
  userId: string,
  result: Result.Result<Problem, string>,
) => {
  return {
    group: "Store",
    entity: "Profile",
    type: "Profile/Delete/Resulted",
    userId,
    result,
  } as const
}

export type DeleteResulted = ReturnType<typeof DeleteResulted>

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

export const CreateResulted = (
  userId: string,
  result: Result.Result<Problem, Profile>,
) => {
  return {
    group: "Store",
    entity: "Profile",
    type: "Profile/CreateResulted",
    userId,
    result,
  } as const
}

export type CreateResulted = ReturnType<typeof CreateResulted>

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
  | Delete
  | DeleteResulted
  | Create
  | CreateResulted
  | Search
  | Searched
  | Received
  | ResetMutations

export type Action = Search | Get | Delete | Edit | ResetMutations

//
//
//
// Update
//
//
//

type OutAction = Snackbar.Action | Action

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
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

      const modelNew = produce(model, (model) => {
        model.mutations.Profile.Edit[msg.userId] = RemoteData.Loading
        model.Profile[userId] = { ...query.value, ...edits }
      })

      return [
        modelNew,
        pipe(
          edit(msg.userId, msg.edits),
          Cmd.fromTask((result) => Edited(msg.userId, query.value, result)),
        ),
        [],
      ]
    }

    case "Profile/Edited": {
      const { userId, result } = msg

      const modeNew = produce(model, (model) => {
        model.mutations.Profile.Edit[userId] = pipe(
          msg.result,
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

      return [modeNew, Cmd.none, []]
    }

    case "Profile/Get": {
      const { userId } = msg

      const modelNew = produce(model, (model) => {
        model.queries.Profile.Get[userId] = RemoteData.Loading
      })

      return [
        modelNew,
        pipe(
          load({ userId }),
          Cmd.fromTask((result) => Got(userId, result)),
        ),
        [],
      ]
    }

    case "Profile/Got": {
      const { userId, result } = msg
      const modelNew = produce(model, (model) => {
        model.queries.Profile.Get[userId] = pipe(
          result,
          RemoteData.fromResult,
          RemoteData.mapSuccess((profile) => profile.userId),
        )

        switch (result.type) {
          case "Err":
            break

          case "Ok":
            model.Profile[result.value.userId] = result.value
            break
        }
      })
      return [modelNew, Cmd.none, []]
    }

    case "Profile/DeleteForever": {
      const modelNew = produce(model, (model) => {
        model.mutations.Profile.DeleteForever[msg.userId] = RemoteData.Loading
      })

      return [
        modelNew,
        pipe(
          deleteForever(msg.userId),
          Cmd.fromTask((result) => DeleteResulted(msg.userId, result)),
        ),
        [],
      ]
    }

    case "Profile/Delete/Resulted": {
      const modelNew = produce(model, (model) => {
        model.mutations.Profile.DeleteForever[msg.userId] =
          RemoteData.fromResult(msg.result)

        if (msg.result.type === "Ok") {
          delete model.Profile[msg.userId]
        }
      })

      return [modelNew, Cmd.none, [Get(msg.userId)]]
    }

    case "Profile/Create": {
      const { profile } = msg
      const { userId } = profile

      const modelNew = produce(model, (model) => {
        model.mutations.Profile.Create[userId] = RemoteData.Loading
        model.Profile[userId] = profile
      })

      return [
        modelNew,
        pipe(
          create(msg.profile),
          Cmd.fromTask((result) => CreateResulted(userId, result)),
        ),
        [],
      ]
    }

    case "Profile/CreateResulted": {
      const { userId, result } = msg

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

      return [modelNew, Cmd.none, [Get(msg.userId)]]
    }

    case "Profile/Search": {
      const { searchText } = msg

      const modelNew = produce(model, (model) => {
        model.queries.Profile.Search[searchText] = RemoteData.Loading
      })

      return [
        modelNew,
        pipe(
          search({ nameOrUsername: searchText }),
          Cmd.fromTask((result) => Searched(searchText, result)),
        ),
        [],
      ]
    }

    case "Profile/Searched": {
      const { result, searchText } = msg

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

      return [modelNew, Cmd.none, []]
    }

    case "Profile/ResetMutations": {
      const modelNew = produce(model, (model) => {
        model.mutations.Profile = {
          Create: {},
          Edit: {},
          DeleteForever: {},
        }
      })

      return [modelNew, Cmd.none, []]
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

export const toGetQuery = (
  userId: string,
  model: Model,
): RemoteData.RemoteData<Problem, Profile> => {
  const query = model.queries.Profile.Get[userId] ?? RemoteData.NotAsked

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
      matchSorter(profiles, nameOrUsername, {
        keys: ["name", "username"],
      }),
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
  (userId: string): Task.Task<Result.Result<Problem, string>> =>
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await Supabase.client
      .from<definitions["profile"]>("profile")
      .delete()
      .match({ id: userId })

    if (response.error) {
      return Result.Err({ message: response.error.message })
    }

    return Result.Ok(userId)
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
