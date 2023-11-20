import { Posix } from "gamezilla/@SHARED/core";
import { ClientId, SessionId } from "../../@SHARED/data";
import { ServerTransportMsg } from "./transport-server";

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

export type ServerMsg = ServerTransportMsg;

//
//
//
//
//
//

export type ToServer = { t: null };

export type ToClient = { t: "server-restarted" };
