import { ClientId, SessionId } from "gamezilla/@SHARED/core";

export type ServerModel = {
  sessions: {
    [sessionId: SessionId]: Session;
  };
};

export type ClientModel =
  | { t: "server-connecting" }
  | { t: "server-connect-error"; errorCount: number }
  | { t: "server-disconnected" }
  | { t: "server-connected" };

export type Session = {
  sessionId: SessionId;
  clientId?: ClientId;
};

export type ServerToClientMsg<ToClient> =
  | { t: "to-client"; msgs: ToClient[] }
  | { t: "session-id"; sessionId: SessionId };

export type ClientToServerMsg<ToServer> = { t: "to-server"; msgs: ToServer[] };

export type ClientWireMsg =
  | { t: "server-connected" }
  | { t: "server-disconnected" }
  | { t: "server-connect-error" };

export type ServerWireMsg =
  | { t: "client-connected"; clientId: ClientId; sessionId: SessionId }
  | { t: "client-disconnected"; clientId: ClientId; sessionId: SessionId };
