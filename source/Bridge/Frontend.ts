import * as Rx from "rxjs";
import { Cmd, Option, Sub, pipe } from "Core";
import { ToBackend, ToFrontend } from "Types";
import { Socket, io } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  backendServerPort,
} from "./Bridge";

//
//
//
//
//
//
//

const productionBackendUrl = "https://gamezilla.herokuapp.com/";

const developmentBackendUrl = `http://localhost:${backendServerPort}/`;

const backendUrl =
  process.env.NODE_ENV === "production"
    ? productionBackendUrl
    : developmentBackendUrl;

const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(backendUrl);

export type ConnectionStatus =
  | "Connecting"
  | "Reconnecting"
  | "Disconnected"
  | "Connected";

const connectionStatus$ = new Rx.Subject<ConnectionStatus>();
const toFrontend$ = new Rx.Subject<ToFrontend>();

connectionStatus$.next("Connecting");

socket.on("connect", () => {
  connectionStatus$.next("Connected");
});

socket.on("connect_error", () => {
  connectionStatus$.next("Reconnecting");
});

socket.on("disconnect", () => {
  connectionStatus$.next("Disconnected");
});

socket.on("ToFrontend", (msg) => {
  toFrontend$.next(msg);
});

//
//
//
// Sub
//
//
//

export const onConnectionStatus = <Msg>(
  mapper: (connectionStatus: ConnectionStatus) => Msg,
): Sub.Sub<Msg> => {
  return pipe(connectionStatus$, Sub.map(mapper));
};

export const fromBackend = <Msg>(
  mapper: (msg: ToFrontend) => Msg,
): Sub.Sub<Msg> => {
  return pipe(toFrontend$, Sub.map(mapper));
};

//
//
//
// Cmd
//
//
//

export const sendToBackend = (msg: ToBackend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    // setTimeout(() => {
    socket.emit("ToBackend", msg);
    // }, 500);
    return Option.None;
  });
};
