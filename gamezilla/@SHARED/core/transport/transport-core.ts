import { ClientId } from "./client-id";
import { SessionId } from "./session-id";

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
