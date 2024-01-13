import { PubSub } from "gamezilla/@SHARED/core/sub";

export type ClientTransportEvent =
  | { t: "server-connected" }
  | { t: "server-disconnected" }
  | { t: "server-connect-error" };

type ClientTransportCommand = { t: "try-reconnect" };

export type IClientTransport<T extends { ToClient: any; ToServer: any }> = {
  toClient: PubSub<T["ToClient"][]>;
  toServer: PubSub<T["ToServer"][]>;
  event: PubSub<ClientTransportEvent>;
  cmd: PubSub<ClientTransportCommand>;
};

export const initClientTransport = <ToServer, ToClient>(): IClientTransport<{
  ToClient: ToClient;
  ToServer: ToServer;
}> => {
  return {
    toClient: PubSub.create(),
    toServer: PubSub.create(),
    event: PubSub.create(),
    cmd: PubSub.create(),
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
