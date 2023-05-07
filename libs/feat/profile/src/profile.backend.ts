import {
  Cmd,
  Err,
  NonEmpty,
  Ok,
  Result,
  Task,
  p,
} from '@gamezilla/shared/core';
import {
  ProfileAvatar,
  UserId,
  Username,
  client,
  definitions,
} from '@gamezilla/shared/app';
import { AppMsg, AuthenticatedRequestCtx } from '@gamezilla/shared/backend';
import { Profile } from './profile-store';
import {
  BackendModel,
  BackendMsg,
  Req,
  ToBackend,
  ToFrontend,
} from './profile.types';

//
//
//
// model
//
//
//

export type Model = BackendModel;

export const init: Model = null;

//
//
//
// update
//
//
//

export type Msg = BackendMsg;

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
    case 'none': {
      return { model };
    }
  }
};

export const updateFromFrontend = ({
  msg,
  model,
  ctx,
  sendToClient,
}: {
  msg: ToBackend;
  model: Model;
  sendToClient: (m: ToFrontend) => Cmd<Msg>;
  ctx: AuthenticatedRequestCtx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return {
    model,
    cmd: p(
      handler({ msg, ctx }),
      Cmd.perform((result) => ({
        ...msg,
        result,
      })),
      Cmd.chain((res) => sendToClient(res))
    ),
  };
};

export const updateFromApp = ({
  msg,
  model,
}: {
  msg: AppMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'client-connected' && msg.userId) {
    return {
      model,
    };
  }

  return { model };
};

const handler =
  ({
    msg,
    ctx,
  }: {
    ctx: AuthenticatedRequestCtx;
    msg: Req;
  }): Task<Result<string, Profile[]>> =>
  async () => {
    if (msg.t === 'find-many') {
      const found = await findMany({
        userIds: msg.userIds,
      })();

      return found;
    }

    if (msg.t === 'change-username') {
      const parsed = Username.decode(msg.username);

      if (parsed.type === 'Err') {
        return parsed;
      }

      const updated = await client
        .from<definitions['user_profile']>('user_profile')
        .update({
          username: parsed.value,
        })
        .eq('id', ctx.currentUserId)
        .single();

      if (updated.error) {
        return Err(updated.error.message);
      }

      return Ok([]);
    }

    if (msg.t === 'find-else-create') {
      const found = await client
        .from<definitions['user_profile']>('user_profile')
        .select('*')
        .eq('id', msg.userId);

      if (found.error) {
        return Err(found.error.message);
      }

      if (NonEmpty.is(found.data)) {
        const row = found.data[0];
        const decoded = decodeRow(row);
        return p(
          decoded,
          Result.map((p) => [p])
        );
      }

      const seed = await ProfileAvatar.generateRandomSeed();
      const created = await client
        .from<definitions['user_profile']>('user_profile')
        .insert([
          {
            id: msg.userId,
            avatar_url: ProfileAvatar.toUrl({
              seed,
              style: 'adventurer-neutral',
            }),
            theme_mode: 'DARK',
            name: 'todo',
            username: 'todo',
          },
        ])
        .single();

      if (created.error) {
        return Err(created.error.message);
      }

      const decoded = decodeRow(created.data);
      return p(
        decoded,
        Result.map((p) => [p])
      );
    }

    return Err('not-implemented');
  };

export const decodeRow = (
  row: definitions['user_profile']
): Result<string, Profile> => {
  const userId = UserId.decode(row.id);
  const username = Username.decode(row.username);

  if (userId.type === 'Ok' && username.type === 'Ok') {
    return Result.Ok({
      userId: userId.value,
      avatarUrl: row.avatar_url,
      name: row.name,
      username: username.value,
      themeMode: rowThemeModeToThemeMode(row.theme_mode),
    });
  }

  // todo better error
  return Result.Err('failed_to_decode_supabase_row');
};

export const findMany =
  ({ userIds }: { userIds: string[] }): Task<Result<string, Profile[]>> =>
  async () => {
    const response = await client
      .from<definitions['user_profile']>('user_profile')
      .select('*')
      .in('id', userIds);

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
      .from<definitions['user_profile']>('user_profile')
      .insert({
        id: userId,
        name,
        username,
        avatar_url: avatarUrl,
        theme_mode: 'SYSTEM',
      })
      .single();

    if (response.data) {
      return decodeRow(response.data);
    }

    return Result.Err(response.error.message);
  };

export const rowThemeModeToThemeMode = (
  themeMode: definitions['user_profile']['theme_mode']
): Profile['themeMode'] => {
  switch (themeMode) {
    case 'DARK':
      return 'Dark';

    case 'LIGHT':
      return 'Light';

    case 'SYSTEM':
      return 'System';
  }
};

export const fromThemeMode = (
  themeMode: Profile['themeMode']
): definitions['user_profile']['theme_mode'] => {
  switch (themeMode) {
    case 'Dark':
      return 'DARK';

    case 'Light':
      return 'LIGHT';

    case 'System':
      return 'SYSTEM';
  }
};
