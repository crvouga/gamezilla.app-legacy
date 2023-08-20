import {
  ImmutableStoreInstance,
  Posix,
  Result,
  Sub,
  createImmutableStore,
} from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import { Space } from "gamezilla/app/space/@SHARED";
import * as Game from "../game/game.core";
import { SpaceId } from "gamezilla/app/@SHARED/data";

export type SpaceDbMsg =
  | {
      t: "set";
      space: Space<Game.ServerModel>;
    }
  | {
      t: "zap";
      spaceId: SpaceId;
    };

export type SpaceWrite = {
  type: "update";
  space: Space<Game.ServerModel>;
};

export type SpaceDb = {
  get: (
    spaceId: SpaceId
  ) => Promise<Result<string, Space<Game.ServerModel> | null>>;
  getByUserId: (
    userId: UserId
  ) => Promise<Result<string, Space<Game.ServerModel> | null>>;
  getAll: () => Promise<Result<string, Space<Game.ServerModel>[]>>;
  set: (space: Space<Game.ServerModel>) => Promise<Result<string, null>>;
  zap: (spaceId: SpaceId) => Promise<Result<string, null>>;
  sub: Sub<SpaceDbMsg>;
};

export type SpaceStoreInstance = {
  spaces: ImmutableStoreInstance<SpaceId, Space<Game.ServerModel>>;
  indexUserId: ImmutableStoreInstance<UserId, SpaceId>;
};

export type SpaceStore = {
  init: (now: number) => SpaceStoreInstance;
  get: (
    instance: SpaceStoreInstance,
    spaceId: SpaceId
  ) => Promise<Space<Game.ServerModel> | undefined>;
  getByUserId: (
    instance: SpaceStoreInstance,
    userId: UserId
  ) => Promise<Space<Game.ServerModel> | undefined>;
  list: (instance: SpaceStoreInstance) => Promise<Space<Game.ServerModel>[]>;
  set: (
    instance: SpaceStoreInstance,
    space: Space<Game.ServerModel>
  ) => Promise<SpaceStoreInstance>;
  zap: (
    instance: SpaceStoreInstance,
    spaceId: SpaceId
  ) => Promise<SpaceStoreInstance>;
};

export const createSpaceStore = (): SpaceStore => {
  const Space = createImmutableStore<SpaceId, Space<Game.ServerModel>>();
  const SpaceIdByUserId = createImmutableStore<UserId, SpaceId>();

  return {
    init(now) {
      return {
        spaces: Space.init(now),
        indexUserId: SpaceIdByUserId.init(now),
      };
    },
    async get(instance, spaceId) {
      return Space.get(instance.spaces, spaceId);
    },
    async getByUserId(instance, userId) {
      const spaceId = await SpaceIdByUserId.get(instance.indexUserId, userId);

      if (!spaceId) {
        return undefined;
      }

      return Space.get(instance.spaces, spaceId);
    },
    async list(instance) {
      return Space.values(instance.spaces);
    },
    async set(instance, space) {
      const spaces = await Space.assoc(instance.spaces, space.spaceId, space);

      const spaceIdsByUserId = await SpaceIdByUserId.assocMany(
        instance.indexUserId,
        Object.values(space.users).map((userId) => [userId, space.spaceId])
      );

      return {
        spaces,
        indexUserId: spaceIdsByUserId,
      };
    },
    async zap(instance, spaceId) {
      const space = await Space.get(instance.spaces, spaceId);
      if (!space) {
        return instance;
      }
      return {
        spaces: await Space.dissoc(instance.spaces, spaceId),
        indexUserId: await SpaceIdByUserId.dissocMany(
          instance.indexUserId,
          Object.values(space.users)
        ),
      };
    },
  };
};
