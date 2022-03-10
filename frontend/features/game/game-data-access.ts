import { RoomNames, tryCatch } from "../../../common";
import { colyseusClient } from "../../data-access";

const create = async () => {
  return tryCatch(() => colyseusClient.create(RoomNames.Game));
};

const reconnect = async ({
  roomId,
  sessionId,
}: {
  roomId: string;
  sessionId: string;
}) => {
  return tryCatch(() => colyseusClient.reconnect(roomId, sessionId));
};

export const gameRoomDataAccess = {
  create,
  reconnect,
};
