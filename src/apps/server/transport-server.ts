import { ToClient, ToServer } from "@gamezilla/app";
import {
  ClientId,
  PubSub,
  ServerWireMsg,
  SessionId,
  TransportServer,
} from "@gamezilla/core";
import http from "http";
import url from "url";
import WebSocket, { WebSocketServer } from "ws";

export const createTransportServer = ({
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
  const sessions = new Map<ClientId, SessionId>();

  httpServer.on("upgrade", (request, socket, head) => {
    const reqUrl = request?.url;

    if (!reqUrl) {
      return;
    }

    const parsedUrl = url.parse(reqUrl, true);

    if (parsedUrl.pathname === "/ws") {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit("connection", ws, request);
      });
    }
  });

  wsServer.on("connection", (ws, req) => {
    const reqUrl = req?.url;

    if (!reqUrl) {
      return;
    }

    const parsedUrl = url.parse(reqUrl, true);

    const maybeSessionId = parsedUrl.query["session-id"];

    const sessionId = SessionId.is(maybeSessionId)
      ? maybeSessionId
      : SessionId.generate();

    const clientId = ClientId.generate();

    console.log(`[server] client connected: ${clientId} ${sessionId}`);

    sessions.set(clientId, sessionId);
    clients.set(clientId, ws);

    ws.send(JSON.stringify({ type: "session-id", sessionId }));

    onWireMsg.publish({ t: "client-connected", clientId, sessionId });

    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());

      if (msg.type === "to-server") {
        onClientMsg.publish({ clientId, sessionId, msg: msg.payload });
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      onWireMsg.publish({ t: "client-disconnected", clientId, sessionId });
    });
  });

  return {
    broadcast: (msg) => () => {
      for (const client of clients.values()) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "to-client", payload: msg }));
        }
      }
    },
    sendToClient: (clientIds: ClientId[], msg: ToClient) => () => {
      for (const clientId of clientIds) {
        const client = clients.get(clientId);

        if (!client) {
          continue;
        }

        if (client.readyState !== WebSocket.OPEN) {
          continue;
        }

        client.send(JSON.stringify({ type: "to-client", payload: msg }));
      }
    },
    onClientMsg,
    onWireMsg,
  };
};
