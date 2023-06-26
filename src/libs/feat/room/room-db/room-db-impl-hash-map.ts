import { Room } from "@gamezilla/shared/app";
import { Ok } from "@gamezilla/shared/core";
import { RoomDb } from "./room-db";

const db = new Map<string, Room>();

const zap: RoomDb["zap"] = async (roomId) => {
  db.delete(roomId);
  return Ok(null);
};

const get: RoomDb["get"] = async (roomId) => {
  const room = db.get(roomId);
  return Ok(room ?? null);
};

const set: RoomDb["set"] = async (room) => {
  db.set(room.roomId, room);
  return Ok(null);
};

export const roomDb: RoomDb = {
  get,
  set,
  zap,
};
