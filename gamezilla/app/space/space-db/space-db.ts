import { Result, Sub } from "gamezilla/@SHARED/core";
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
