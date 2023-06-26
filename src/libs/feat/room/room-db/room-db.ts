import { Room, RoomId } from "@gamezilla/shared/app";
import { Result } from "@gamezilla/shared/core";

export type RoomDb = {
  get: (roomId: RoomId) => Promise<Result<string, Room | null>>;
  set: (room: Room) => Promise<Result<string, null>>;
  zap: (roomId: RoomId) => Promise<Result<string, null>>;
};
