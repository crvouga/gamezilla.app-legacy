import * as Option from "Core/Option";
import { Board } from "./Board";

export type BackendModel = {
  rooms: {
    [roomId: string]: Room;
  };
};

export type Room = {
  board: Board;
  players: {
    X: Option.Option<{ clientId: string }>;
    O: Option.Option<{ clientId: string }>;
  };
  host: {
    clientId: string;
  };
  clients: { [clientId: string]: string };
};

export type FrontendModel = {
  rooms: {
    [roomId: string]: Room;
  };
};
