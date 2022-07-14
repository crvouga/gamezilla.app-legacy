import { ToBackend, ToFrontend } from "Types";

export type ClientId = string;

//
//
//
// socket.io
//
//
//

export type ServerToClientEvents = {
  ToFrontend: (msg: ToFrontend) => void;
};

export type ClientToServerEvents = {
  ToBackend: (msg: ToBackend) => void;
};

//
//
//
//
//
//
//

export const backendServerPort = 5000;
