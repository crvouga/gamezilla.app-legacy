import { ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data";
import { PubSub } from "gamezilla/@SHARED/core/sub";

export type ServerTransportMsg =
  | { t: "client-connected"; clientId: ClientId; sessionId: SessionId }
  | { t: "client-disconnected"; clientId: ClientId; sessionId: SessionId }
  | { t: "server-started" };

export type IServerTransport<T extends { ToClient: any; ToServer: any }> = {
  toClient: PubSub<{
    [clientId: ClientId]: {
      clientId: ClientId;
      msgs: T["ToClient"][];
    };
  }>;
  toClientBroadcast: PubSub<T["ToClient"][]>;
  toServer: PubSub<{
    msgs: T["ToServer"][];
    clientId: ClientId;
    sessionId: SessionId;
  }>;
  topicPublish: PubSub<{
    topics: string[];
    msg: T["ToClient"];
  }>;
  topicSubscribe: PubSub<{
    topics: string[];
    clientId: ClientId;
  }>;
  wire: PubSub<ServerTransportMsg>;
};

export const initServerTransport = <ToServer, ToClient>(): IServerTransport<{
  ToClient: ToClient;
  ToServer: ToServer;
}> => {
  return {
    toClient: PubSub.create(),
    toClientBroadcast: PubSub.create(),
    toServer: PubSub.create(),
    topicPublish: PubSub.create(),
    topicSubscribe: PubSub.create(),
    wire: PubSub.create(),
  };
};
