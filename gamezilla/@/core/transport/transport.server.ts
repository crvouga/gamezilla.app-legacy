import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { PubSub } from "../sub";
import { ClientId } from "./client-id";
import { SessionId } from "./session-id";
import {
  ClientToServerMsg,
  ServerToClientMsg,
  ServerWireMsg,
  TransportServer,
} from "./transport-core";

export const createTransportServer = <ToServer, ToClient>({
  httpServer,
  onClientMsg,
  onWireMsg,
}: {
  httpServer: http.Server;
  onClientMsg: PubSub<{
    msg: ToServer;
    clientId: ClientId;
    sessionId: SessionId;
  }>;
  onWireMsg: PubSub<ServerWireMsg>;
}): TransportServer<ToClient, ToServer> => {
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

    console.log(`[server] client connected: ${clientId} ${sessionId}`);

    clients.set(clientId, ws);

    ws.send(JSON.stringify({ t: "session-id", sessionId }));

    onWireMsg.publish({ t: "client-connected", clientId, sessionId });

    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString()) as ClientToServerMsg<ToServer>; // leap of faith

      if (msg.t === "to-server") {
        onClientMsg.publish({ clientId, sessionId, msg: msg.c });
        return;
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      onWireMsg.publish({ t: "client-disconnected", clientId, sessionId });
    });
  });

  const send = (client: WebSocket, msg: ServerToClientMsg<ToClient>) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  };

  return {
    broadcast: (msg) => () => {
      for (const client of clients.values()) {
        send(client, { t: "to-client", c: msg });
      }
    },
    sendToClient: (clientIds: ClientId[], msg: ToClient) => () => {
      for (const clientId of clientIds) {
        const client = clients.get(clientId);

        if (!client) {
          continue;
        }

        send(client, { t: "to-client", c: msg });
      }
    },
    onClientMsg,
    onWireMsg,
  };
};
