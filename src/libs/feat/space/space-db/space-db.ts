import { Space, SpaceId } from "@gamezilla/shared/app";
import { Result } from "@gamezilla/shared/core";

export type SpaceDb = {
  get: (spaceId: SpaceId) => Promise<Result<string, Space | null>>;
  set: (space: Space) => Promise<Result<string, null>>;
  zap: (spaceId: SpaceId) => Promise<Result<string, null>>;
};
