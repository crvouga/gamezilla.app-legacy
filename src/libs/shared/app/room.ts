import { RoomId, UserId } from "./data";

export type Room = {
  status?: "started" | "ended";
  hostId: UserId;
  roomId: RoomId;
  users: {
    [userId: UserId]: UserId;
  };
};
