import {
  ClientId,
  Cmd,
  Err,
  NonEmpty,
  Ok,
  Result,
  Task,
  p,
} from "gamezilla/@SHARED/core";
import {
  ProfileAvatar,
  UserId,
  Username,
  Profile,
} from "gamezilla/app/@SHARED/data";
import {
  supabaseClient,
  definitions,
} from "gamezilla/app/@SHARED/third-party-services";
import {
  ServerEffect,
  ReqCtx,
  ServerEvent,
} from "gamezilla/app/@SHARED/server";
import {
  Req,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./profile.core";

//
//
//
// model
//
//
//

export type Model = ServerModel;

export const init: Model = null;

//
//
//
// update
//
//
//

export type Msg = ServerMsg;

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case "none": {
      return { model };
    }
  }
};

export const updateFromClient = ({
  msg,
  model,
  ctx,
  sendBack,
}: {
  msg: ToServer;
  model: Model;
  sendBack: (m: ToClient) => Cmd<Msg>;
  ctx: ReqCtx | null;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (!ctx) {
    return { model };
  }

  return {
    model,
    cmd: p(
      handler({ msg, ctx }),
      Cmd.perform((result) => ({
        ...msg,
        result,
      })),
      Cmd.chain((res) => sendBack(res))
    ),
  };
};

export const updateFromEvent = ({
  sendToClient,
  msg,
  model,
}: {
  sendToClient: (clientId: ClientId[], m: ToClient) => Cmd<Msg>;
  msg: ServerEvent;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "client-authenticated") {
    return {
      model,
      cmd: p(
        () => findElseCreate({ userId: msg.userId }),
        Cmd.perform(
          (result): ToClient => ({
            t: "current-user-profile",
            result,
          })
        ),
        Cmd.chain((res) => sendToClient([msg.clientId], res))
      ),
    };
  }

  return { model };
};

const handler =
  ({
    msg,
    ctx,
  }: {
    msg: Req;
    ctx: { currentUserId: UserId };
  }): Task<Result<string, Profile[]>> =>
  async () => {
    if (msg.t === "find-many") {
      const found = await findMany({
        userIds: msg.userIds,
      })();

      return found;
    }

    if (msg.t === "change-username") {
      const parsed = Username.decode(msg.username);

      if (parsed.t === "err") {
        return parsed;
      }

      const updated = await supabaseClient
        .from<definitions["user_profile"]>("user_profile")
        .update({
          username: parsed.value,
        })
        .eq("id", ctx.currentUserId)
        .single();

      if (updated.error) {
        return Err(updated.error.message);
      }

      return Ok([]);
    }

    return Err("not-implemented");
  };

const findElseCreate = async ({ userId }: { userId: UserId }) => {
  const found = await supabaseClient
    .from<definitions["user_profile"]>("user_profile")
    .select("*")
    .eq("id", userId);

  if (found.error) {
    return Err(found.error.message);
  }

  if (NonEmpty.is(found.data)) {
    const row = found.data[0];
    const decoded = decodeRow(row);
    return Result.mapOk(decoded, (p) => [p]);
  }

  const seed = await ProfileAvatar.generateRandomSeed();
  const created = await supabaseClient
    .from<definitions["user_profile"]>("user_profile")
    .insert([
      {
        id: userId,
        avatar_url: ProfileAvatar.toUrl({
          seed,
          style: "adventurer-neutral",
        }),
        theme_mode: "DARK",
        name: "todo",
        username: "todo",
      },
    ])
    .single();

  if (created.error) {
    return Err(created.error.message);
  }

  const decoded = decodeRow(created.data);
  return Result.mapOk(decoded, (p) => [p]);
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

export const findMany =
  ({ userIds }: { userIds: string[] }): Task<Result<string, Profile[]>> =>
  async () => {
    const response = await supabaseClient
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
    const response = await supabaseClient
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

type ThemeMode = "Dark" | "Light" | "System";
export const rowThemeModeToThemeMode = (
  themeMode: definitions["user_profile"]["theme_mode"]
): ThemeMode => {
  switch (themeMode) {
    case "DARK":
      return "Dark";

    case "LIGHT":
      return "Light";

    case "SYSTEM":
      return "System";
  }
};

export const fromThemeMode = (
  themeMode: ThemeMode | null | undefined
): definitions["user_profile"]["theme_mode"] => {
  switch (themeMode) {
    case "Dark":
      return "DARK";

    case "Light":
      return "LIGHT";

    case "System":
      return "SYSTEM";

    case null:
    case undefined:
      return "SYSTEM";
  }
};
