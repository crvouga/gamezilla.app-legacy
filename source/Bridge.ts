import * as Rx from "rxjs";
import { Cmd, Option, Sub, pipe } from "Core";
import { BackendMsg, ToBackend, ToFrontend } from "Types";

//
//
//
// Bridge
//
//
//
export type ClientId = string;

export const bridge$ = {
  toFrontend: new Rx.Subject<[ClientId, ToFrontend]>(),
  broadcast: new Rx.Subject<ToFrontend>(),
  toBackend: new Rx.Subject<ToBackend>(),
  connectionStatus: new Rx.Subject<ConnectionStatus>(),
  onConnect: new Rx.Subject<ClientId>(),
  onDisconnect: new Rx.Subject<ClientId>(),
};

export const sendToFrontend = (
  clientId: ClientId,
  msg: ToFrontend,
): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    bridge$.toFrontend.next([clientId, msg]);
    return Option.None;
  });
};

export const broadcast = (msg: ToFrontend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    bridge$.broadcast.next(msg);
    return Option.None;
  });
};

export const sendToBackend = (msg: ToBackend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    bridge$.toBackend.next(msg);
    return Option.None;
  });
};

export type ConnectionStatus =
  | "Connecting"
  | "Reconnecting"
  | "Disconnected"
  | "Connected";

export const onConnectionStatus = <Msg>(
  mapper: (connectionStatus: ConnectionStatus) => Msg,
): Sub.Sub<Msg> => {
  return pipe(bridge$.connectionStatus, Sub.map(mapper));
};

export const onConnect = <Msg>(
  mapper: (clientId: ClientId) => Msg,
): Sub.Sub<Msg> => {
  return pipe(bridge$.onConnect, Sub.map(mapper));
};

export const onDisconnect = <Msg>(
  mapper: (clientId: ClientId) => Msg,
): Sub.Sub<Msg> => {
  return pipe(bridge$.onDisconnect, Sub.map(mapper));
};

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
