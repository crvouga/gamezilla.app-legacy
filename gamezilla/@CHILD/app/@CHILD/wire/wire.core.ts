import { Posix } from "gamezilla/@SHARED/core";
import { ClientId, SessionId } from "../../@SHARED/data";

//
//
//
//
//
//

export type ClientModel =
  | { t: "server-connecting" }
  | { t: "server-connect-error"; errorCount: number }
  | { t: "server-disconnected" }
  | { t: "server-connected" };

export type ClientMsg =
  | { t: "server-connected" }
  | { t: "server-disconnected" }
  | { t: "server-connect-error" };

export type ServerModel = {
  clientsBySessionId: {
    [sessionId: SessionId]: Client;
  };
  serverStartedAt: Posix | null;
};

export type Client = {
  sessionId: SessionId;
  clientId: ClientId;
  status: "connected" | "disconnected";
};

export type ServerMsg =
  | { t: "client-connected"; clientId: ClientId; sessionId: SessionId }
  | { t: "client-disconnected"; clientId: ClientId; sessionId: SessionId }
  | { t: "server-started" };

//
//
//
//
//
//

export type ToServer = { t: null };

export type ToClient = { t: "server-restarted" };

//
//
//
//
//
//

export type ServerToClientMsg<ToClient> =
  | { t: "to-client"; msgs: ToClient[] }
  | { t: "session-id"; sessionId: SessionId };

export type ClientToServerMsg<ToServer> = { t: "to-server"; msgs: ToServer[] };
