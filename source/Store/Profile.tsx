import { option, task } from "fp-ts"
import * as Result from "Core/Result"
import * as Rx from "rxjs"
import { sub } from "../Core"
import * as Supabase from "../Supabase"
import { definitions } from "../supabase-types"

//
//
//
// Model
//
//
//

export type Profile = {
  userId: string
  username: string
  name: string
  avatarUrl: string
  themeMode: ThemeMode
}

export type ThemeMode = "Light" | "Dark" | "System"

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
    result,
    userId,
    previous,
  } as const)

export type Edited = ReturnType<typeof Edited>

export const Get = (userId: string) => {
  return {
    group: "Store",
    type: "Profile/Get",
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
    userId,
    result,
  } as const
}

export type Got = ReturnType<typeof Got>

export const DeleteForever = (userId: string) => {
  return {
    group: "Store",
    type: "Profile/DeleteForever",
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
    type: "Profile/Created",
    userId,
    result,
  } as const
}

export type Created = ReturnType<typeof Created>

export const Search = (searchText: string) => {
  return {
    group: "Store",
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
    type: "Profile/Searched",
    result,
    searchText,
  } as const
}

export type Searched = ReturnType<typeof Searched>

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

//
//
//
//
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

type Problem = { message: string }

export const load =
  ({
    userId,
  }: {
    userId: string
  }): task.Task<Result.Result<Problem, Profile>> =>
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
  }): task.Task<Result.Result<Problem, Profile>> =>
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
  (userId: string): task.Task<Result.Result<Problem, {}>> =>
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
  }): task.Task<Result.Result<Problem, Profile[]>> =>
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
  ): task.Task<Result.Result<Problem, Profile>> =>
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

export const subscription = ({
  userId,
}: {
  userId: string
}): sub.Sub<option.Option<Profile>> => {
  return new Rx.Observable<option.Option<Profile>>((subscriber) => {
    const subscription = Supabase.client
      .from<definitions["profile"]>(`profile:id=eq.${userId}`)
      .on("INSERT", (payload) => {
        subscriber.next(option.some(rowToProfile(payload.new)))
      })
      .on("UPDATE", (payload) => {
        subscriber.next(option.some(rowToProfile(payload.new)))
      })
      .on("DELETE", () => {
        subscriber.next(option.none)
      })
      .subscribe()

    return () => {
      Supabase.client.removeSubscription(subscription)
      subscription.unsubscribe()
    }
  })
}
