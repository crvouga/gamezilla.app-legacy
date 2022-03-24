import { Room } from "colyseus.js";
import { RoomNames, tryCatch } from "../../../common";
import { colyseusClient } from "../../data-access";

export type IRoom = Room<unknown>;

export const create = async () => {
  return await tryCatch(() => colyseusClient.create(RoomNames.Game));
};

export const reconnect = async ({
  roomId,
  sessionId,
}: {
  roomId: string;
  sessionId: string;
}) => {
  return await tryCatch(() => colyseusClient.reconnect(roomId, sessionId));
};
