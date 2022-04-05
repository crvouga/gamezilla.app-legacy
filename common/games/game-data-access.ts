import { Client, Room } from "colyseus.js";
import { RoomName } from "./game-room";

export type IRoom = Room<unknown>;

export const create = async (colyseusClient: Client) => {
  return colyseusClient.create(RoomName);
};

export const reconnect = async (
  colyseusClient: Client,
  {
    roomId,
    sessionId,
  }: {
    roomId: string;
    sessionId: string;
  }
) => {
  return colyseusClient.reconnect(roomId, sessionId);
};
