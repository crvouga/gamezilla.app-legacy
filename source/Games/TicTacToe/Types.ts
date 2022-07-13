import * as Option from "Core/Option";
import { Board } from "./Board";

export type BackendModel = {
  rooms: {
    [roomId: string]: Room;
  };
};

type Player =
  | { type: "User"; userId: string }
  | { type: "Computer" }
  | { type: "None" };

export type Room = {
  board: Board;
  players: {
    X: Player;
    O: Player;
  };
  hostUserId: string;
  userIds: { [userId: string]: string };
};

export type FrontendModel = {
  rooms: {
    [roomId: string]: Room;
  };
};

export type BackendMsg = { group: "TicTacToe"; type: "Noop" };

export type FrontendMsg =
  | { group: "TicTacToe"; type: "ClickedNewRoom" }
  | { group: "TicTacToe"; type: "ClickedBack" };

export type ToFrontend = {
  group: "TicTacToe";
  type: "CurrentRoom";
  room: Room;
};

export type ToFronend = { group: "TicTacToe"; type: "NewRoom" };
