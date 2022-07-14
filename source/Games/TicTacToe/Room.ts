import * as Board from "./Board";

export type RoomId = number;

export type Room = {
  roomId: RoomId;
  board: Board.Board;
  players: {
    X: Player;
    O: Player;
  };
  hostId: string;
};

export const initRoom = (roomId: RoomId, hostId: string): Room => {
  return {
    roomId,
    board: Board.emptyBoard,
    players: {
      X: { type: "User", userId: hostId },
      O: { type: "User", userId: hostId },
    },
    hostId,
  };
};

export type Player =
  | { type: "User"; userId: string }
  | { type: "Computer" }
  | { type: "None" };
