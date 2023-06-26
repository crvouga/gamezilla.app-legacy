import { RemoteResult, Result } from "@gamezilla/shared/core";
import { SpaceId, UserId, Username } from "@gamezilla/shared/app";
import { Profile, Space, SpaceViewCtx } from "@gamezilla/shared/client";
import * as GameServer from "./game.server";
import * as Game from "./game.shared";

const { Ok, Err } = Result;

//
//
//
// Model
//
//
//

export type SharedModel = {
  spaces: {
    [spaceId: SpaceId]: Space;
  };
  users: {
    [userId: UserId]: {
      userId: UserId;
      spaceId: SpaceId;
    };
  };
  profiles: {
    [userId: UserId]: {
      userId: UserId;
      username: Username;
      avatarUrl: string;
    };
  };
};

export type ServerModel = SharedModel & {
  games: {
    [spaceId: SpaceId]: Game.ServerModel;
  };
};

export type ClientModel = SharedModel & {
  games: {
    [spaceId: SpaceId]: Game.ClientModel;
  };
  requests: {
    [key in Req["t"]]?: RemoteResult<Problem, "none">;
  };
  previewUserId: UserId | null;
  modal: ModalModel;
};

type ModalModel = "none" | "user-preview" | "users";

export type ClientSpace = {
  spaceId: SpaceId;
  hostId: UserId;
  game?: Game.ClientModel;
};

export type SpaceUser = {
  userId: UserId;
  spaceId: SpaceId;
};

//
//
//
//
//

export const toUserIds = function* ({
  model,
}: {
  model: SharedModel;
}): Generator<UserId> {
  for (const userId in model.users) {
    if (!UserId.is(userId)) {
      continue;
    }
    yield userId;
  }
};

export const toUsers = function* ({
  model,
}: {
  model: SharedModel;
}): Generator<SpaceUser> {
  for (const userId of toUserIds({ model })) {
    const user = model.users[userId];

    if (!user) {
      continue;
    }

    yield user;
  }
};

export const toUsersBySpaceId = function* ({
  spaceId,
  model,
}: {
  spaceId: SpaceId;
  model: SharedModel;
}): Generator<SpaceUser> {
  for (const user of toUsers({ model })) {
    if (user.spaceId === spaceId) {
      yield user;
    }
  }
};

export const toProfilesBySpaceId = function* ({
  ctx,
}: {
  ctx: SpaceViewCtx;
}): Generator<Profile> {
  for (const userId in ctx.space.users) {
    if (!UserId.is(userId)) {
      continue;
    }

    const profile = ctx.profiles[userId];

    if (profile) {
      yield profile;
    }
  }
};

export const toSpace = ({
  spaceId,
  model,
}: {
  spaceId: SpaceId;
  model: SharedModel;
}): Space | null => {
  const space = model.spaces[spaceId];

  if (!space) {
    return null;
  }

  for (const user of toUsersBySpaceId({ model, spaceId })) {
    space.users[user.userId] = user.userId;
  }

  return space;
};

//
//
//
// Msg
//
//
//

export type ToClient = (Res | { t: "game"; c: Game.ToClient }) & Extra;

export type ToServer = (Req | { t: "game"; c: Game.ToServer }) & Extra;

export type ServerMsg = { t: "game"; spaceId: SpaceId; c: Game.ServerMsg };

export type ClientMsg =
  | Req
  | { t: "game"; c: Game.ClientMsg }
  | { t: "modal-closed" }
  | { t: "modal-open"; c: ModalModel }
  | { t: "clicked-space"; spaceId: SpaceId }
  | { t: "clicked-user"; userId: UserId }
  | { t: "clicked-user-link"; userId: UserId };

type Extra = {
  profile?: {
    userId: UserId;
    username: Username;
    avatarUrl: string;
  };
  initiatorMsg?: unknown;
};

//
//
//
//
//

type Model = ServerModel;

export type Req =
  | { t: "list" }
  | { t: "create"; spaceId: SpaceId; gameName?: Game.GameName }
  | { t: "destroy"; userId: UserId }
  | { t: "join"; userId: UserId; spaceId: SpaceId }
  | { t: "leave"; userId: UserId }
  | { t: "input-game"; gameName?: Game.GameName };

export type Res = Req & { result: Result<Problem, Model> };

export type Problem =
  | "must_be_host"
  | "must_be_guest"
  | "not_in_space"
  | "already_in_space"
  | "space_not_found"
  | "impossible_state_space_id_taken";

export const handle = ({
  ctx,
  msg,
  model,
}: {
  ctx: { currentUserId: UserId };
  msg: Req;
  model: Model;
}): Result<Problem, Model> => {
  switch (msg.t) {
    case "list": {
      return Ok(model);
    }

    case "create": {
      const user = model.users[ctx.currentUserId];

      if (user) {
        return Err("already_in_space");
      }

      const space = model.spaces[msg.spaceId];

      if (space) {
        return Err("impossible_state_space_id_taken");
      }

      const { gameName } = msg;

      const gameNew = gameName
        ? GameServer.init({
            gameName,
            ctx: {
              currentUserId: ctx.currentUserId,
            },
          })
        : undefined;

      const spaceNew: Space = {
        spaceId: msg.spaceId,
        hostId: ctx.currentUserId,
        users: {
          [ctx.currentUserId]: ctx.currentUserId,
        },
      };

      const userNew: SpaceUser = {
        spaceId: msg.spaceId,
        userId: ctx.currentUserId,
      };

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [spaceNew.spaceId]: gameNew,
        },
        spaces: {
          ...model.spaces,
          [spaceNew.spaceId]: spaceNew,
        },
        users: {
          ...model.users,
          [userNew.userId]: userNew,
        },
      };

      return Ok(modelNew);
    }

    case "destroy": {
      const user = model.users[ctx.currentUserId];

      if (!user) {
        return Err("not_in_space");
      }

      const space = model.spaces[user.spaceId];

      if (!space) {
        return Err("space_not_found");
      }

      if (space.hostId !== user.userId) {
        return Err("must_be_host");
      }

      const spacesNew = removeKey(space.spaceId, model.spaces);

      const gamesNew = removeKey(space.spaceId, model.games);

      const usersNew = filterObject(
        model.users,
        (entry) => entry[1].spaceId !== user.spaceId
      );

      const modelNew: Model = {
        ...model,
        games: gamesNew,
        spaces: spacesNew,
        users: usersNew,
      };

      return Ok(modelNew);
    }

    case "join": {
      const user = model.users[ctx.currentUserId];

      if (user) {
        return Err("already_in_space");
      }

      const userNew: SpaceUser = {
        spaceId: msg.spaceId,
        userId: ctx.currentUserId,
      };

      const modelNew: Model = {
        ...model,
        users: {
          ...model.users,
          [ctx.currentUserId]: userNew,
        },
      };

      return Ok(modelNew);
    }

    case "leave": {
      const user = model.users[ctx.currentUserId];

      if (!user) {
        return Err("not_in_space");
      }

      const space = model.spaces[user.spaceId];

      if (!space) {
        return Err("space_not_found");
      }

      if (user.userId === space.hostId) {
        return Err("must_be_guest");
      }

      const usersNew = removeKey(user.userId, model.users);

      const modelNew: Model = {
        ...model,
        users: usersNew,
      };

      return Ok(modelNew);
    }

    case "input-game": {
      const { gameName } = msg;

      const user = model.users[ctx.currentUserId];

      if (!user) {
        return Err("not_in_space");
      }

      const space = model.spaces[user.spaceId];

      if (!space) {
        return Err("not_in_space");
      }

      if (space.hostId !== user.userId) {
        return Err("must_be_host");
      }

      if (!gameName) {
        const modelNew: ServerModel = {
          ...model,
          games: removeKey(space.spaceId, model.games),
        };

        return Ok(modelNew);
      }

      const gameNew = GameServer.init({
        gameName,
        ctx,
      });

      const modelNew: ServerModel = {
        ...model,
        games: {
          ...model.games,
          [space.spaceId]: gameNew,
        },
      };

      return Ok(modelNew);
    }
  }
};

//
//
//
// Helpers
//
//
//

const removeKey = <T>(key: keyof T, obj: T): Omit<T, keyof T> => {
  const { [key]: _value, ...rest } = obj;
  return rest;
};

type Entry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

const filterObject = <T extends object>(
  obj: T,
  predicate: (entry: Entry<T>, i: number, arr: Entry<T>[]) => boolean
): T => {
  return Object.fromEntries(
    (Object.entries(obj) as Entry<T>[]).filter(predicate)
  ) as T;
};
