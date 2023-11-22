import { PubSub } from "gamezilla/@SHARED/core/sub";

export type ClientTransportMsg =
  | { t: "server-connected" }
  | { t: "server-disconnected" }
  | { t: "server-connect-error" };

export type IClientTransport<T extends { ToClient: any; ToServer: any }> = {
  toClient: PubSub<T["ToClient"][]>;
  toServer: PubSub<T["ToServer"][]>;
  wire: PubSub<ClientTransportMsg>;
};

export const initClientTransport = <ToServer, ToClient>(): IClientTransport<{
  ToClient: ToClient;
  ToServer: ToServer;
}> => {
  return {
    toClient: PubSub.create(),
    toServer: PubSub.create(),
    wire: PubSub.create(),
  };
};

export type ClientTransportImpl = ClientTransportWebSocketImpl;

export type ClientTransportWebSocketImpl = {
  t: "web-sockets";
  serverUrl: string;
  endpoint: string;
};
