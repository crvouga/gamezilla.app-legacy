import { Eff } from "../eff";
import { Sub } from "../sub";
import { ClientId } from "./client-id";
import { SessionId } from "./session-id";

export type ServerToClientMsg<ToClient> =
  | { t: "to-client"; c: ToClient }
  | { t: "session-id"; sessionId: SessionId };

export type ClientToServerMsg<ToServer> = { t: "to-server"; c: ToServer };

/**
 * TransportClient represents the a client side object that sends and receives messages to and from the server.
 */
export type TransportClient<ToClient, ToServer> = {
  sendToServer: (msg: ToServer) => Eff;
  onServerMsg: Sub<ToClient>;
  onWireMsg: Sub<ClientWireMsg>;
};

export type ClientWireMsg =
  | { t: "server-connected" }
  | { t: "server-disconnected" }
  | { t: "server-connect-error" };

/**
 * TransportServer represents the a server side object that sends and receives messages to and from the client.
 */
export type TransportServer<ToClient, ToServer> = {
  sendToClient: (clientId: ClientId[], msg: ToClient) => Eff;
  broadcast: (msg: ToClient) => Eff;
  onClientMsg: Sub<{ msg: ToServer; clientId: ClientId; sessionId: SessionId }>;
  onWireMsg: Sub<ServerWireMsg>;
};

export type ServerWireMsg =
  | { t: "client-connected"; clientId: ClientId; sessionId: SessionId }
  | { t: "client-disconnected"; clientId: ClientId; sessionId: SessionId };
