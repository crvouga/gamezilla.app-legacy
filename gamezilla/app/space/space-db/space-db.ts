import { Result } from "gamezilla/@/core";
import { UserId } from "gamezilla/app/@/data";
import { Space } from "gamezilla/app/space/@";
import * as Game from "../game/game.core";
import { SpaceId } from "gamezilla/app/@/data";

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
};
