import { GameSpace, UserId, GameSpaceId } from "@gamezilla/shared/app";
import { Result } from "@gamezilla/shared/core";

export type GameSpaceDb = {
  get: (spaceId: GameSpaceId) => Promise<Result<string, GameSpace | null>>;
  getByUserId: (userId: UserId) => Promise<Result<string, GameSpace | null>>;
  set: (space: GameSpace) => Promise<Result<string, null>>;
  zap: (spaceId: GameSpaceId) => Promise<Result<string, null>>;
};
