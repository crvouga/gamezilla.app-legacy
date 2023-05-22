import {
  Cmd,
  exhaustive,
  p,
  RemoteResult,
  Result,
  Task,
  Unit,
  matchSort,
} from "@gamezilla/shared/core";
import { client, definitions, UserId, Username } from "@gamezilla/shared/app";

//
//
//
// Model
//
//
//

export type Model = {
  profiles: {
    [id: UserId]: Profile;
  };
  findMany: {
    [key: FindManyKey]: RemoteResult<Problem, UserId[]>;
  };
  search: {
    [searchText: string]: RemoteResult<Problem, UserId[]>;
  };
  edit: {
    [userId: UserId]: RemoteResult<Problem, UserId>;
  };
  deleteForever: {
    [userId: UserId]: RemoteResult<Problem, Unit>;
  };
  create: {
    [userId: UserId]: RemoteResult<Problem, UserId>;
  };
};

export type Profile = {
  userId: UserId;
  username: Username;
  name: string;
  avatarUrl: string;
  themeMode: "Light" | "Dark" | "System";
};

type Problem = string;

type FindManyKey = string & { _opaque: "FindManyKey" };

const sep = ",";

const isFindManyKey = (key: unknown): key is FindManyKey => {
  return (
    typeof key === "string" && key.split(sep).every((item) => UserId.is(item))
  );
};

export const toFindManyKey = (userIds: UserId[]): FindManyKey => {
  const key = userIds.sort().join(sep);

  if (isFindManyKey(key)) {
    return key;
  }

  throw new Error("Failed to create find many key");
};

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
};

//
//
//
// Msg
//
//
//

export type Req =
  | ["reset-mutations"]
  | ["find-many", { userIds: UserId[] }]
  | ["edit-one", { userId: UserId; edits: Partial<Profile> }]
  | ["delete-forever", { userId: UserId }]
  | ["create-one", { profile: Profile }]
  | ["search", { searchText: string }];

export type Res =
  | [
      "find-many-done",
      { userIds: UserId[]; result: Result<Problem, Profile[]> }
    ]
  | [
      "edit-one-done",
      {
        userId: UserId;
        previous: Profile;
        result: Result<Problem, Profile>;
      }
    ]
  | ["delete-forever-done", { userId: UserId; result: Result<Problem, Unit> }]
  | ["create-one-done", { userId: UserId; result: Result<Problem, Profile> }]
  | ["search-done", { searchText: string; result: Result<Problem, Profile[]> }];

export type Msg = Res | Req;

export type Action = ["profile", Req];

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "edit-one-done": {
      const { userId, result } = msg[1];

      if (result.t === "err") {
        const modelNew: Model = {
          ...model,
          profiles: removeKey(userId, model.profiles),
          edit: {
            ...model.edit,
            [userId]: RemoteResult.Err(result.error),
          },
        };

        return [modelNew, Cmd.None];
      }

      const modelNew: Model = {
        ...model,
        profiles: {
          ...model.profiles,
          [userId]: result.value,
        },
        edit: {
          ...model.edit,
          [userId]: RemoteResult.Ok(userId),
        },
      };

      return [modelNew, Cmd.None];
    }

    case "find-many-done": {
      const { userIds, result } = msg[1];

      const key = toFindManyKey(userIds);

      const profilesNew: { [id: UserId]: Profile } = {};
      if (result.t === "ok") {
        for (const profile of result.value) {
          profilesNew[profile.userId] = profile;
        }
      }

      const modelNew = {
        ...model,
        profiles: {
          ...model.profiles,
          ...profilesNew,
        },
        findMany: {
          ...model.findMany,
          [key]: p(
            result,
            RemoteResult.map((profiles) =>
              profiles.map((profile) => profile.userId)
            )
          ),
        },
      };

      return [modelNew, Cmd.None];
    }

    case "delete-forever-done": {
      const { result, userId } = msg[1];

      const modelNew: Model = {
        ...model,
        profiles: removeKey(userId, model.profiles),
        deleteForever: {
          ...model.deleteForever,
          [userId]: result,
        },
      };

      return [modelNew, Cmd.None];
    }

    case "create-one-done": {
      const { userId, result } = msg[1];

      const modelNew: Model = {
        ...model,
        create: {
          ...model.create,
          [userId]: p(
            result,
            RemoteResult.map((profile) => profile.userId)
          ),
        },

        profiles: {
          ...model.profiles,
          [userId]: result.t === "ok" ? result.value : undefined,
        },
      };

      return [modelNew, Cmd.None];
    }

    case "search-done": {
      const { result, searchText } = msg[1];

      const hits: Profile[] = result.t === "err" ? [] : result.value;

      const byId = hits.reduce((acc, hit) => {
        acc[hit.userId] = hit;
        return acc;
      }, {} as Record<UserId, Profile>);

      const modelNew: Model = {
        ...model,
        search: {
          ...model.search,
          [searchText]: p(
            result,
            RemoteResult.map((profiles) =>
              profiles.map((profile) => profile.userId)
            )
          ),
        },
        profiles: {
          ...model.profiles,
          ...byId,
        },
      };

      return [modelNew, Cmd.None];
    }

    default:
      return runAction(["profile", msg], model);
    // return exhaustive(msg);
  }
};

export const runAction = (msg: Action, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[1][0]) {
    case "edit-one": {
      const { userId, edits } = msg[1][1];

      const profile = model.profiles[userId];

      if (!profile) {
        return [model, Cmd.None];
      }

      const modelNew: Model = {
        ...model,
        edit: {
          ...model.edit,
          [userId]: RemoteResult.Loading,
        },
        profiles: {
          ...model.profiles,
          [userId]: { ...profile, ...edits },
        },
      };

      return [
        modelNew,
        p(
          edit(userId, edits),
          Cmd.perform(
            (result): Msg => [
              "edit-one-done",
              { previous: profile, userId, result },
            ]
          )
        ),
      ];
    }

    case "find-many": {
      const { userIds } = msg[1][1];

      if (userIds.length === 0) {
        return [model, Cmd.None];
      }

      const key = toFindManyKey(userIds);

      const modelNew: Model = {
        ...model,
        findMany: {
          ...model.findMany,
          [key]: RemoteResult.Loading,
        },
      };

      return [
        modelNew,
        p(
          findMany({ userIds }),
          Cmd.perform((result): Msg => ["find-many-done", { userIds, result }])
        ),
      ];
    }

    case "delete-forever": {
      const { userId } = msg[1][1];

      const modelNew: Model = {
        ...model,
        deleteForever: {
          ...model.deleteForever,
          [userId]: RemoteResult.Loading,
        },
      };

      return [
        modelNew,
        p(
          deleteForever(userId),
          Cmd.perform(
            (result): Msg => ["delete-forever-done", { userId, result }]
          )
        ),
      ];
    }

    case "create-one": {
      const { profile } = msg[1][1];
      const modelNew: Model = {
        ...model,
        create: {
          ...model.create,
          [profile.userId]: RemoteResult.Loading,
        },
        profiles: {
          ...model.profiles,
          [profile.userId]: profile,
        },
      };

      return [
        modelNew,
        p(
          create(profile),
          Cmd.perform(
            (result): Msg => [
              "create-one-done",
              { userId: profile.userId, result },
            ]
          )
        ),
      ];
    }

    case "search": {
      const { searchText } = msg[1][1];

      const modelNew: Model = {
        ...model,
        search: {
          ...model.search,
          [searchText]: RemoteResult.Loading,
        },
      };

      return [
        modelNew,
        p(
          search({ nameOrUsername: searchText }),
          Cmd.perform((result): Msg => ["search-done", { result, searchText }])
        ),
      ];
    }

    case "reset-mutations": {
      return [{ ...model, create: {}, deleteForever: {}, edit: {} }, Cmd.None];
    }

    default:
      return exhaustive(msg[1]);
  }
};

//
//
//
// Selectors
//
//
//

export const toSearch = (nameOrUsername: string, store: Model) => {
  return matchSort(
    Object.values(store.profiles),
    (x) => x.username,
    nameOrUsername
  );
};

//
//
//
// Data Access
//
//
//

export const rowThemeModeToThemeMode = (
  themeMode: definitions["user_profile"]["theme_mode"]
): Profile["themeMode"] => {
  switch (themeMode) {
    case "DARK":
      return "Dark";

    case "LIGHT":
      return "Light";

    case "SYSTEM":
      return "System";
  }
};

const fromThemeMode = (
  themeMode: Profile["themeMode"]
): definitions["user_profile"]["theme_mode"] => {
  switch (themeMode) {
    case "Dark":
      return "DARK";

    case "Light":
      return "LIGHT";

    case "System":
      return "SYSTEM";
  }
};

export const decodeRow = (
  row: definitions["user_profile"]
): Result<string, Profile> => {
  const userId = UserId.decode(row.id);
  const username = Username.decode(row.username);

  if (userId.t === "ok" && username.t === "ok") {
    return Result.Ok({
      userId: userId.value,
      avatarUrl: row.avatar_url,
      name: row.name,
      username: username.value,
      themeMode: rowThemeModeToThemeMode(row.theme_mode),
    });
  }

  // todo better error
  return Result.Err("failed_to_decode_supabase_row");
};

export const findOne =
  ({ userId }: { userId: UserId }): Task<Result<string, Profile>> =>
  async () => {
    const response = await client
      .from<definitions["user_profile"]>("user_profile")
      .select("*")
      .eq("id", userId)
      .single();

    if (response.error) {
      return Result.Err(response.error.message);
    }

    return decodeRow(response.data);
  };

export const findMany =
  ({ userIds }: { userIds: string[] }): Task<Result<string, Profile[]>> =>
  async () => {
    const response = await client
      .from<definitions["user_profile"]>("user_profile")
      .select("*")
      .in("id", userIds);

    if (response.error) {
      return Result.Err(response.error.message);
    }

    const result = Result.combine(response.data.map(decodeRow));

    return result;
  };

export const create =
  ({
    userId,
    name,
    username,
    avatarUrl,
  }: {
    userId: UserId;
    name: string;
    username: string;
    avatarUrl: string;
  }): Task<Result<string, Profile>> =>
  async () => {
    const response = await client
      .from<definitions["user_profile"]>("user_profile")
      .insert({
        id: userId,
        name,
        username,
        avatar_url: avatarUrl,
        theme_mode: "SYSTEM",
      })
      .single();

    if (response.data) {
      return decodeRow(response.data);
    }

    return Result.Err(response.error.message);
  };

export const deleteForever =
  (userId: UserId): Task<Result<Problem, Unit>> =>
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await client
      .from<definitions["user_profile"]>("user_profile")
      .delete()
      .match({ id: userId });

    if (response.error) {
      return Result.Err(response.error.message);
    }

    return Result.Ok(Unit);
  };

export const search =
  ({
    nameOrUsername,
  }: {
    nameOrUsername: string;
  }): Task<Result<string, Profile[]>> =>
  async () => {
    const response = await client
      .from<definitions["user_profile"]>("user_profile")
      .select("*")
      .ilike(
        "name",
        `%${nameOrUsername
          .split(" ")
          .map((_) => _.replace(" ", ""))
          .join("%")}%`
      );

    if (response.error) {
      return Result.Err(response.error.message);
    }

    return Result.combine(response.data.map(decodeRow));
  };

export const edit =
  (userId: UserId, edits: Partial<Profile>): Task<Result<string, Profile>> =>
  async () => {
    const response = await client
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
      .single();

    if (response.error) {
      return Result.Err(response.error.message);
    }

    return decodeRow(response.data);
  };

//
//
// Helpers
//
//

const removeKey = <Key extends keyof Record, Record>(
  key: Key,
  record: Record
): Omit<Record, Key> => {
  const { [key]: _value, ...rest } = record;

  return rest;
};
