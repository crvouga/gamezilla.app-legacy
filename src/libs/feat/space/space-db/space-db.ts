import { Result } from "@gamezilla/core";
import { UserId } from "@gamezilla/shared/app";
import { Space } from "src/libs/feat/space/shared";
import { ServerModel } from "../game/game.core";
import { SpaceId } from "../space-id";

export type SpaceDb = {
  //
  get: (spaceId: SpaceId) => Promise<Result<string, Space<ServerModel> | null>>;
  getByUserId: (
    userId: UserId
  ) => Promise<Result<string, Space<ServerModel> | null>>;
  getAll: () => Promise<Result<string, Space<ServerModel>[]>>;
  //
  set: (space: Space<ServerModel>) => Promise<Result<string, null>>;
  zap: (spaceId: SpaceId) => Promise<Result<string, null>>;
};
