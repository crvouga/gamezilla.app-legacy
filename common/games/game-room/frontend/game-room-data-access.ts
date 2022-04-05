import { Client } from "colyseus.js";
import { Task } from "../../../utils";
import { IGameRoomState, RoomName } from "../../game-room";

export const GameRoomDataAccess = (colyseusClient: Client) => {
  const create = () => {
    return Task.tryCatch(() => colyseusClient.create<IGameRoomState>(RoomName));
  };

  const reconnect = ({
    roomId,
    sessionId,
  }: {
    roomId: string;
    sessionId: string;
  }) => {
    return Task.tryCatch(() =>
      colyseusClient.reconnect<IGameRoomState>(roomId, sessionId)
    );
  };

  return {
    create,
    reconnect,
  };
};
