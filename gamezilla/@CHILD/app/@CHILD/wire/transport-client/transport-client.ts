import { PubSub } from "gamezilla/@SHARED/core/sub";

export type ClientTransportEvent =
  | { t: "server-connected" }
  | { t: "server-disconnected" }
  | { t: "server-connect-error" }
  | { t: "got-bad-msgs"; reason: "codebase-version-mismatch" };

type ClientTransportCommand = { t: "try-reconnect" };

export type IClientTransport<T extends { MsgToClient: any; MsgToServer: any }> =
  {
    toClient: PubSub<T["MsgToClient"][]>;
    toServer: PubSub<T["MsgToServer"][]>;
    msgEvt: PubSub<ClientTransportEvent>;
    msgCmd: PubSub<ClientTransportCommand>;
  };

export const initClientTransport = <
  MsgToServer,
  MsgToClient
>(): IClientTransport<{
  MsgToClient: MsgToClient;
  MsgToServer: MsgToServer;
}> => {
  return {
    toClient: PubSub.create(),
    toServer: PubSub.create(),
    msgEvt: PubSub.create(),
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
