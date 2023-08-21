import { StoreInstance, Posix } from "gamezilla/@SHARED/core";
import { SpaceId, UserId } from "gamezilla/app/@SHARED/data";
import { Space } from "gamezilla/app/space/@SHARED";
import * as Game from "../game/game.core";

export type SpaceStoreInstance = {
  spaces: StoreInstance<SpaceId, Space<Game.ServerModel>>;
  indexUserId: StoreInstance<UserId, SpaceId>;
};

export type SpaceStore = {
  toJSON: () => unknown;
  init: (now: Posix) => SpaceStoreInstance;
  get: (
    now: Posix,
    instance: SpaceStoreInstance,
    spaceId: SpaceId
  ) => Promise<Space<Game.ServerModel> | undefined>;
  getByUserId: (
    now: Posix,
    instance: SpaceStoreInstance,
    userId: UserId
  ) => Promise<Space<Game.ServerModel> | undefined>;
  list: (
    now: Posix,
    instance: SpaceStoreInstance
  ) => Promise<Space<Game.ServerModel>[]>;
  assoc: (
    now: Posix,
    instance: SpaceStoreInstance,
    space: Space<Game.ServerModel>
  ) => Promise<SpaceStoreInstance>;
  dissoc: (
    now: Posix,
    instance: SpaceStoreInstance,
    spaceId: SpaceId
  ) => Promise<SpaceStoreInstance>;
};
