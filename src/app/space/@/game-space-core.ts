import { UserId } from "src/app/@/app";
import { SpaceId } from "../space-id";

export type Space<GameModel> = {
  visibility?: "public" | "private";
  state?: "started" | "ended";
  spaceId: SpaceId;
  hostId: UserId;
  users: {
    [userId: UserId]: UserId;
  };
  game?: GameModel | null;
};

export type SpaceMsg =
  | { t: "user-left"; userId: UserId }
  | { t: "user-joined"; userId: UserId };
