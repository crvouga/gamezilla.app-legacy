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
  fromClient,
  toClientBroadcast,
  toClient,
  wire,
}: {
  httpServer: http.Server;
  toClientBroadcast: PubSub<ToClient[]>;
  toClient: PubSub<{
    [clientId: ClientId]: {
      clientId: ClientId;
      msgs: ToClient[];
    };
  }>;
  fromClient: PubSub<{
    msgs: ToServer[];
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
        fromClient.publish({ clientId, sessionId, msgs: msg.msgs });
        return;
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      wire.publish({ t: "client-disconnected", clientId, sessionId });
    });
  });

  const send = (client: WebSocket, msg: ServerToClientMsg<ToClient>) => {
    if (msg.t === "to-client" && msg.msgs.length === 0) {
      return;
    }
    if (client.readyState !== WebSocket.OPEN) {
      return;
    }
    client.send(JSON.stringify(msg));
  };

  toClientBroadcast.subscribe((msgs) => {
    for (const client of clients.values()) {
      send(client, { t: "to-client", msgs });
    }
  });

  toClient.subscribe((toClient) => {
    for (const clientId in toClient) {
      if (!ClientId.is(clientId)) {
        continue;
      }

      const toClientSingle = toClient[clientId];

      if (!toClientSingle) {
        continue;
      }

      const client = clients.get(clientId);

      if (!client) {
        continue;
      }
      send(client, { t: "to-client", msgs: toClientSingle.msgs });
    }
  });
};
