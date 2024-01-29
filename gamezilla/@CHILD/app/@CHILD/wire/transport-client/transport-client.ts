import { PubSub } from "gamezilla/@SHARED/core/sub";

export type ClientTransportEvent =
  | { t: "server-connected" }
  | { t: "server-disconnected" }
  | { t: "server-connect-error" }
  | { t: "got-bad-msgs"; reason: "codebase-version-mismatch" };

type ClientTransportCommand = { t: "try-reconnect" };

export type IClientTransport<T extends { ToClient: any; ToServer: any }> = {
  toClient: PubSub<T["ToClient"][]>;
  toServer: PubSub<T["ToServer"][]>;
  msgEvent: PubSub<ClientTransportEvent>;
  msgCmd: PubSub<ClientTransportCommand>;
};

export const initClientTransport = <ToServer, ToClient>(): IClientTransport<{
  ToClient: ToClient;
  ToServer: ToServer;
}> => {
  return {
    toClient: PubSub.create(),
    toServer: PubSub.create(),
    msgEvent: PubSub.create(),
    msgCmd: PubSub.create(),
  };
};

export type ClientTransportImpl =
  | ClientTransportWebSocketImpl
  | ClientTransportSocketIOImpl;

export type ClientTransportWebSocketImpl = {
  t: "web-sockets";
  serverUrl: string;
  endpoint: string;
};

export type ClientTransportSocketIOImpl = {
  t: "socket-io";
  serverUrl: string;
};
