import { Result } from "@gamezilla/core";
import { GameSpaceId, UserId } from "@gamezilla/shared/app";
import { GameSpace } from "src/libs/feat/game-space/shared";
import { ServerModel } from "../game/game.core";

export type GameSpaceDb = {
  //
  get: (
    spaceId: GameSpaceId
  ) => Promise<Result<string, GameSpace<ServerModel> | null>>;
  getByUserId: (
    userId: UserId
  ) => Promise<Result<string, GameSpace<ServerModel> | null>>;
  getAll: () => Promise<Result<string, GameSpace<ServerModel>[]>>;
  //
  set: (space: GameSpace<ServerModel>) => Promise<Result<string, null>>;
  zap: (spaceId: GameSpaceId) => Promise<Result<string, null>>;
};
