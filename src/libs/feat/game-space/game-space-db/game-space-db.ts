import { Result } from "@gamezilla/core";
import { GameSpaceId, UserId } from "@gamezilla/shared/app";
import { GameSpace } from "@gamezilla/shared/game-space";

export type GameSpaceDb = {
  get: (spaceId: GameSpaceId) => Promise<Result<string, GameSpace | null>>;
  getByUserId: (userId: UserId) => Promise<Result<string, GameSpace | null>>;
  set: (space: GameSpace) => Promise<Result<string, null>>;
  zap: (spaceId: GameSpaceId) => Promise<Result<string, null>>;
};
