import { Room } from "colyseus.js";
import { eventChannel } from "redux-saga";
import { RoomNames, tryCatch } from "../../../common";
import { colyseusClient } from "../../data-access";

export type IGameRoom = Room<unknown>;

export const create = async () => {
  const result = await tryCatch(() => colyseusClient.create(RoomNames.Game));

  if (result.type === "success") {
    return createRoomChannel(result.data);
  }

  return null;
};

export const reconnect = async ({
  roomId,
  sessionId,
}: {
  roomId: string;
  sessionId: string;
}) => {
  const result = await tryCatch(() =>
    colyseusClient.reconnect(roomId, sessionId)
  );

  if (result.type === "success") {
    return createRoomChannel(result.data);
  }

  return null;
};

export type IRoomAction =
  | {
      type: "room/leave";
      code: number;
    }
  | {
      type: "room/message";
      message: {
        type: string;
        payload: unknown;
      };
    };

export const createRoomChannel = (room: Room<unknown>) => {
  return eventChannel<IRoomAction>((emit) => {
    room.onLeave((code) => {
      emit({
        type: "room/leave",
        code,
      });
    });

    room.onMessage("*", (messageType, message) => {
      emit({
        type: "room/message",
        message: {
          type: String(messageType),
          payload: message,
        },
      });
    });

    return () => {
      room.removeAllListeners();
    };
  });
};
