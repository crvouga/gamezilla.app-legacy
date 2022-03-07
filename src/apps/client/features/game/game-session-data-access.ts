import { colyseusClient } from "@apps/client/data-access";
import { RoomNames } from "@libs/server-interface";

export const create = async () => {
  await colyseusClient.create(RoomNames.GameSession);
};
