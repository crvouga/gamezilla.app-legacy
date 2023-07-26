import { GameSpaceId, UserId } from "@gamezilla/shared/app";

export type GameSpace = {
  visibility?: "public" | "private";
  status?: "started" | "ended";
  gameSpaceId: GameSpaceId;
  hostId: UserId;
  users: {
    [userId: UserId]: UserId;
  };
};

export type GameSpaceMsg =
  | { t: "user-left"; userId: UserId }
  | { t: "user-joined"; userId: UserId };
