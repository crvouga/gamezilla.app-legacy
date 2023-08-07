import { ClientId } from "./client-id";
import { SessionId } from "./session-id";

/**
 * TransportClient represents the a client side object that sends and receives messages to and from the server.
 */
export type TransportClient<ToClient, ToServer> = {
  sendToServer: (msg: ToServer) => void;
  onServerMsg: (cb: (msg: ToClient) => void) => void;
  onConnect: (cb: () => void) => void;
  onDisconnect: (cb: () => void) => void;
  onConnectError: (cb: () => void) => void;
};

/**
 * TransportServer represents the a server side object that sends and receives messages to and from the client.
 */
export type TransportServer<ToClient, ToServer> = {
  sendToClient: (clientId: ClientId[], msg: ToClient) => void;
  broadcast: (msg: ToClient) => void;
  onClientMsg: (
    cb: (clientId: ClientId, sessionId: SessionId, msg: ToServer) => void
  ) => void;
  onConnect: (cb: (clientId: ClientId, sessionId: SessionId) => void) => void;
  onDisconnect: (
    cb: (clientId: ClientId, sessionId: SessionId) => void
  ) => void;
};
