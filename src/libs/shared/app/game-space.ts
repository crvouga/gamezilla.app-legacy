import { GameSpaceId, UserId } from "./data";

export type GameSpace = {
  status?: "started" | "ended";
  gameSpaceId: GameSpaceId;
  hostId: UserId;
  users: {
    [userId: UserId]: UserId;
  };
};
