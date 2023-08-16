import { Posix, Result, Sub } from "gamezilla/@SHARED/core";
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

export type SpaceQuery = {
  findOne: (
    time: Posix,
    spaceId: SpaceId
  ) => Promise<Space<Game.ServerModel> | null>;
  findOneByUserId: (
    time: Posix,
    userId: UserId
  ) => Promise<Space<Game.ServerModel> | null>;
};

export const spaceQuery = (): SpaceQuery => {
  return {
    async findOne(time, spaceId) {
      return null;
    },
    async findOneByUserId(time, userId) {
      return null;
    },
  };
};

export type SpaceMutations = {
  append: (time: Posix, space: Space<Game.ServerModel>) => Promise<void>;
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
