import produce from "immer"
import { matchSorter } from "match-sorter"
import { Cmd, exhaustive, p, RemoteData, Result, Task, Unit } from "../Core"
import { UserId, Username } from "../Data"
import * as Supabase from "../Supabase"
import { definitions } from "../Supabase.Types"


//
//
//
// Model
//
//
//

export type Model = {
    profiles: {
        [id: UserId]: Profile
    }
    findMany: {
        [key: FindManyKey]: RemoteData<Problem, UserId[]>
    }
    search: {
        [searchText: string]: RemoteData<Problem, UserId[]>
    },
    edit: {
        [userId: UserId]: RemoteData<Problem, UserId>
    }
    deleteForever: {
        [userId: UserId]: RemoteData<Problem, Unit>
    }
    create: {
        [userId: UserId]: RemoteData<Problem, UserId>
    }
}


export type Profile = {
    userId: UserId
    username: Username
    name: string
    avatarUrl: string
    themeMode: "Light" | "Dark" | "System"
}

type Problem = string

type FindManyKey = string & { _opaque: "FindManyKey" }

const sep = ","

const isFindManyKey = (key: unknown): key is FindManyKey => {
    return (
        typeof key === "string" &&
        key.split(sep).every((item) => UserId.is(item))
    )
}

export const toFindManyKey = (userIds: UserId[]): FindManyKey => {
    const key = userIds.sort().join(sep)

    if (isFindManyKey(key)) {
        return key
    }

    throw new Error("Failed to create find many key")
}

//
//
//
// Init
//
//
//

export const init: Model = {
    profiles: {},
    findMany: {},
    search: {},
    create: {},
    edit: {},
    deleteForever: {},
}

//
//
//
// Msg
//
//
//

export type Req =
    | ['ResetMutations']
    | ['FindMany', { userIds: UserId[] }]
    | ['EditOne', { userId: UserId, edits: Partial<Profile> }]
    | ['DeleteForever', { userId: UserId }]
    | ['CreateOne', { profile: Profile }]
    | ['Search', { searchText: string }]

export type Res =
    | ['FindMany_Done', { userIds: UserId[]; result: Result<Problem, Profile[]> }]
    | ['EditOne_Done', {
        userId: UserId
        previous: Profile
        result: Result<Problem, Profile>
    }]
    | ['DeleteForever_Done', { userId: UserId; result: Result<Problem, Unit> }]
    | ['CreateOne_Done', { userId: UserId; result: Result<Problem, Profile> }]
    | ['Search_Done', { searchText: string, result: Result<Problem, Profile[]> }]

export type Msg =
    Res

export type Action =
    ['Profile', Req]

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "EditOne_Done": {
            const { userId, result } = msg[1]

            if (result.type === 'Err') {
                const modelNew: Model = {
                    ...model,
                    profiles: removeKey(userId, model.profiles),
                    edit: {
                        ...model.edit,
                        [userId]: RemoteData.Err(result.error)
                    }
                }

                return [modelNew, Cmd.None]
            }

            const modelNew: Model = {
                ...model,
                profiles: {
                    ...model.profiles,
                    [userId]: result.value
                },
                edit: {
                    ...model.edit,
                    [userId]: RemoteData.Ok(userId)
                }
            }

            return [modelNew, Cmd.None]

        }

        case "FindMany_Done": {
            const { userIds, result } = msg[1]

            const key = toFindManyKey(userIds)

            const modelNew = produce(model, (model) => {
                model.findMany[key] = p(
                    result,
                    RemoteData.map((profiles) =>
                        profiles.map((profile) => profile.userId),
                    ),
                )

                if (result.type === "Ok") {
                    for (const profile of result.value) {
                        model.profiles[profile.userId] = profile
                    }
                }
            })
            return [modelNew, Cmd.None]
        }

        case "DeleteForever_Done": {
            const { result, userId } = msg[1]
            const modelNew = produce(model, (model) => {
                model.deleteForever[userId] = result

                switch (result.type) {
                    case "Err":
                        break

                    case "Ok":
                        delete model.profiles[userId]
                }
            })
            return [modelNew, Cmd.None]
        }

        case "CreateOne_Done": {
            const { userId, result } = msg[1]

            const modelNew = produce(model, (model) => {
                model.create[userId] = p(
                    result,
                    RemoteData.map((profile) => profile.userId),
                )

                switch (result.type) {
                    case "Err":
                        delete model.profiles[userId]
                        break

                    case "Ok":
                        model.profiles[userId] = result.value
                        break
                }
            })

            return [modelNew, Cmd.None]
        }

        case "Search_Done": {
            const { result, searchText } = msg[1]

            const modelNew = produce(model, (model) => {
                model.search[searchText] = p(
                    result,
                    RemoteData.map((profiles) =>
                        profiles.map((profile) => profile.userId),
                    ),
                )

                switch (result.type) {
                    case "Err":
                        break

                    case "Ok":
                        for (const profile of result.value) {
                            model.profiles[profile.userId] = profile
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

export const runAction = (msg: Action, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[1][0]) {
        case "EditOne": {
            const { userId, edits } = msg[1][1]

            const profile = model.profiles[userId]

            if (!profile) {
                return [model, Cmd.None]
            }

            const modelNew = produce(model, (model) => {
                model.edit[userId] = RemoteData.Loading

                model.profiles[userId] = { ...profile, ...edits }
            })

            return [
                modelNew,
                p(
                    edit(userId, edits),
                    Cmd.perform(
                        (result): Msg => [
                            "EditOne_Done",
                            { previous: profile, userId, result },
                        ],
                    ),
                ),
            ]
        }

        case "FindMany": {
            const { userIds } = msg[1][1]

            const modelNew = produce(model, (model) => {
                const key = toFindManyKey(userIds)
                model.findMany[key] = RemoteData.Loading
            })

            return [
                modelNew,
                p(
                    findMany({ userIds }),
                    Cmd.perform((result): Msg => ["FindMany_Done", { userIds, result }]),
                ),
            ]
        }

        case "DeleteForever": {
            const { userId } = msg[1][1]

            const modelNew = produce(model, (model) => {
                model.deleteForever[userId] = RemoteData.Loading
            })

            return [
                modelNew,
                p(
                    deleteForever(userId),
                    Cmd.perform(
                        (result): Msg => ["DeleteForever_Done", { userId, result }],
                    ),
                ),
            ]
        }

        case "CreateOne": {
            const { profile, } = msg[1][1]
            const modelNew = produce(model, (model) => {
                model.create[profile.userId] = RemoteData.Loading
                model.profiles[profile.userId] = profile
            })

            return [
                modelNew,
                p(
                    create(profile),
                    Cmd.perform((result): Msg => ["CreateOne_Done", { userId: profile.userId, result }]),
                ),
            ]
        }

        case "Search": {
            const { searchText } = msg[1][1]

            const modelNew = produce(model, (model) => {
                model.search[searchText] = RemoteData.Loading
            })

            return [
                modelNew,
                p(
                    search({ nameOrUsername: searchText }),
                    Cmd.perform((result): Msg => ["Search_Done", { result, searchText }]),
                ),
            ]
        }

        case "ResetMutations": {
            return [{ ...model, create: {}, deleteForever: {}, edit: {}, }, Cmd.None]
        }



        default:
            return exhaustive(msg[1])
    }
}

//
//
//
// Selectors
//
//
//

export const toSearch = (nameOrUsername: string, store: Model) => {
    return matchSorter(Object.values(store.profiles), nameOrUsername, {
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
): Result<string, Profile> => {
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
        userId: UserId
    }): Task<Result<string, Profile>> =>
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
    }): Task<Result<string, Profile[]>> =>
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
        userId: UserId
        name: string
        username: string
        avatarUrl: string
    }): Task<Result<string, Profile>> =>
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
    (userId: UserId): Task<Result<Problem, Unit>> =>
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
    }): Task<Result<string, Profile[]>> =>
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
        userId: UserId,
        edits: Partial<Profile>,
    ): Task<Result<string, Profile>> =>
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



// 
// 
// Helpers
// 
// 

const removeKey = <Key extends keyof Record, Record>(
    key: Key,
    record: Record,
): Omit<Record, Key> => {
    const { [key]: _value, ...rest } = record

    return rest
}
