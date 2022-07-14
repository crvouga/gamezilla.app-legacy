import { Board } from "./Board";

export type BackendModel = {
  rooms: {
    [roomId: string]: Room;
  };
};

export type FrontendModel = {
  rooms: {
    [roomId: string]: Room;
  };
};

export type BackendMsg = ["Noop"];

export type FrontendMsg = ["ClickedNewRoom"] | ["ClickedBack"];

export type ToFrontend = ["CurrentRoom", Room];

export type ToBackend = ["ClickedNewRoom"];

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
