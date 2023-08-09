import { GameSpaceId, UserId } from "@gamezilla/shared/app";

export type GameSpace<GameModel> = {
  visibility?: "public" | "private";
  state?: "started" | "ended";
  gameSpaceId: GameSpaceId;
  hostId: UserId;
  users: {
    [userId: UserId]: UserId;
  };
  game?: GameModel | null;
};

export type GameSpaceMsg =
  | { t: "user-left"; userId: UserId }
  | { t: "user-joined"; userId: UserId };
