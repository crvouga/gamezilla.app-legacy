import { Sub } from "..";
import { Cmd } from "../cmd";
import { ClientId } from "./client-id";
import { SessionId } from "./session-id";

export type SessionMsg = { t: "session-id"; sessionId: SessionId };

/**
 * TransportClient represents the a client side object that sends and receives messages to and from the server.
 */
export type TransportClient<ToClient, ToServer> = {
  sendToServer: (msg: ToServer) => Cmd;
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
  sendToClient: (clientId: ClientId[], msg: ToClient) => Cmd;
  broadcast: (msg: ToClient) => Cmd;
  onClientMsg: Sub<{ msg: ToServer; clientId: ClientId; sessionId: SessionId }>;
  onWireMsg: Sub<ServerWireMsg>;
};

export type ServerWireMsg =
  | { t: "client-connected"; clientId: ClientId; sessionId: SessionId }
  | { t: "client-disconnected"; clientId: ClientId; sessionId: SessionId };
