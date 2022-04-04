import { Room } from "colyseus.js";
import { RoomNames } from "../../../common";
import { colyseusClient } from "../../data-access";

export type IRoom = Room<unknown>;

export const create = async () => {
  return colyseusClient.create(RoomNames.Game);
};

export const reconnect = async ({
  roomId,
  sessionId,
}: {
  roomId: string;
  sessionId: string;
}) => {
  return colyseusClient.reconnect(roomId, sessionId);
};
