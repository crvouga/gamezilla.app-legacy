import { SpaceId, UserId } from "./data";

export type Space = {
  status?: "started" | "ended";
  hostId: UserId;
  spaceId: SpaceId;
  users: {
    [userId: UserId]: UserId;
  };
};
