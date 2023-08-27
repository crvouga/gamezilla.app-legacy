import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { PubSub } from "../sub";
import { ClientId } from "./client-id";
import { SessionId } from "./session-id";
import {
  ClientToServerMsg,
  ServerToClientMsg,
  ServerWireMsg,
} from "./transport-core";

export const attachServerTransport = <ToServer, ToClient>({
  httpServer,
  clientToServer,
  serverToClientBroadcast,
  serverToClient,
  wire,
}: {
  httpServer: http.Server;
  serverToClientBroadcast: PubSub<ToClient>;
  serverToClient: PubSub<{
    clientIds: ClientId[];
    msg: ToClient;
  }>;
  clientToServer: PubSub<{
    msg: ToServer;
    clientId: ClientId;
    sessionId: SessionId;
  }>;
  wire: PubSub<ServerWireMsg>;
}) => {
  const wsServer = new WebSocketServer({ noServer: true });
  const clients = new Map<ClientId, WebSocket>();

  httpServer.on("upgrade", (req, socket, head) => {
    const reqUrl = req?.url;

    if (!reqUrl) {
      return;
    }

    const parsedUrl = new URL(reqUrl, `http://${req.headers.host}`);

    if (parsedUrl.pathname === "/ws") {
      wsServer.handleUpgrade(req, socket, head, (ws) => {
        wsServer.emit("connection", ws, req);
      });
    }
  });

  wsServer.on("connection", (ws, req) => {
    const reqUrl = req?.url;

    if (!reqUrl) {
      return;
    }

    const parsedUrl = new URL(reqUrl, `http://${req.headers.host}`);

    const maybeSessionId = parsedUrl.searchParams.get("session-id");

    const sessionId = SessionId.is(maybeSessionId)
      ? maybeSessionId
      : SessionId.generate();

    const clientId = ClientId.generate();

    clients.set(clientId, ws);

    ws.send(JSON.stringify({ t: "session-id", sessionId }));

    wire.publish({ t: "client-connected", clientId, sessionId });

    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString()) as ClientToServerMsg<ToServer>; // leap of faith

      if (msg.t === "to-server") {
        clientToServer.publish({ clientId, sessionId, msg: msg.c });
        return;
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      wire.publish({ t: "client-disconnected", clientId, sessionId });
    });
  });

  const send = (client: WebSocket, msg: ServerToClientMsg<ToClient>) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  };

  serverToClientBroadcast.subscribe((msg) => {
    for (const client of clients.values()) {
      send(client, { t: "to-client", c: msg });
    }
  });

  serverToClient.subscribe(({ clientIds, msg }) => {
    for (const clientId of clientIds) {
      const client = clients.get(clientId);

      if (!client) {
        continue;
      }

      send(client, { t: "to-client", c: msg });
    }
  });
};
