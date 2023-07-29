import { Err, Ok, RemoteResult, Result } from "@gamezilla/core";
import { GameSpaceId, UserId, Username } from "@gamezilla/shared/app";
import { Profile } from "@gamezilla/shared/client";
import { GameSpace, GameSpaceViewCtx } from "@gamezilla/shared/game-space";
import * as Game from "./game.core";

//
//
//
// Model
//
//
//

export type CoreModel = {
  spaces: {
    [spaceId: GameSpaceId]: GameSpace;
  };
  users: {
    [userId: UserId]: {
      userId: UserId;
      spaceId: GameSpaceId;
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

export type ServerModel = CoreModel & {
  games: {
    [spaceId: GameSpaceId]: Game.ServerModel;
  };
};

export type ClientModel = CoreModel & {
  games: {
    [spaceId: GameSpaceId]: Game.ClientModel;
  };
  requests: {
    [key in Req["t"]]?: RemoteResult<Problem, null>;
  };
  previewUserId: UserId | null;
  modal: ModalModel;
};

type ModalModel = null | "user-preview" | "users";

export type GameSpaceUser = {
  userId: UserId;
  spaceId: GameSpaceId;
};

//
//
//
//
//

export const toUserIds = function* ({
  model,
}: {
  model: CoreModel;
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
  model: CoreModel;
}): Generator<GameSpaceUser> {
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
  spaceId: GameSpaceId;
  model: CoreModel;
}): Generator<GameSpaceUser> {
  for (const user of toUsers({ model })) {
    if (user.spaceId === spaceId) {
      yield user;
    }
  }
};

export const toProfilesBySpaceId = function* ({
  ctx,
}: {
  ctx: GameSpaceViewCtx;
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
  spaceId: GameSpaceId;
  model: CoreModel;
}): GameSpace | null => {
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

export type ServerMsg = { t: "game"; spaceId: GameSpaceId; c: Game.ServerMsg };

export type ClientMsg =
  | Req
  | { t: "game"; c: Game.ClientMsg }
  | { t: "modal-closed" }
  | { t: "modal-open"; c: ModalModel }
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
  | { t: "create"; spaceId: GameSpaceId; gameName?: Game.GameName }
  | { t: "destroy"; userId: UserId }
  | { t: "join"; userId: UserId; spaceId: GameSpaceId }
  | { t: "leave"; userId: UserId }
  | { t: "input-game"; gameName?: Game.GameName };

export type Res = Req & { result: Result<string, Model> };

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

      const spaceNew: GameSpace = {
        gameSpaceId: msg.spaceId,
        hostId: ctx.currentUserId,
        users: {
          [ctx.currentUserId]: ctx.currentUserId,
        },
      };

      const userNew: GameSpaceUser = {
        spaceId: msg.spaceId,
        userId: ctx.currentUserId,
      };

      const modelNew: Model = {
        ...model,
        games: model.games,
        spaces: {
          ...model.spaces,
          [spaceNew.gameSpaceId]: spaceNew,
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

      const spacesNew = removeKey(space.gameSpaceId, model.spaces);

      const gamesNew = removeKey(space.gameSpaceId, model.games);

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

      const userNew: GameSpaceUser = {
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
      //
      return Ok(model);
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
