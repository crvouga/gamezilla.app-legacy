import { ServerWebSocket } from "bun";
import { PubSub } from "../../../@SHARED/core/sub";
import { ClientId } from "../@SHARED/data/client-id";
import { SessionId } from "../@SHARED/data/session-id";
import {
  ClientToServerMsg,
  ServerToClientMsg,
  ServerWireMsg,
} from "./wire-core";

type ServerWebSocketData = {
  clientId: ClientId;
  sessionId: SessionId;
};

export const attachServerTransport = <ToServer, ToClient>({
  fromClient,
  toClientBroadcast,
  toClient,
  wire,
}: {
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
  const clients = new Map<ClientId, ServerWebSocket<ServerWebSocketData>>();

  const port = Number(process.env["PORT"]) || 5000;

  const server = Bun.serve({
    port: port,

    fetch(req, server) {
      const reqUrl = req.url;

      const parsedUrl = new URL(reqUrl);

      if (parsedUrl.pathname === "/ws") {
        const maybeSessionId = parsedUrl.searchParams.get("session-id");

        const sessionId = SessionId.is(maybeSessionId)
          ? maybeSessionId
          : SessionId.generate();

        const clientId = ClientId.generate();

        const data: ServerWebSocketData = {
          clientId,
          sessionId,
        };

        if (server.upgrade(req, { data })) {
          return;
        }
        return new Response("Upgrade failed :(", { status: 500 });
      }

      return new Response("Hello from gamezilla server", { status: 404 });
    },

    websocket: {
      message(ws: ServerWebSocket<ServerWebSocketData>, message) {
        const msg = JSON.parse(
          message.toString()
        ) as ClientToServerMsg<ToServer>; // leap of faith

        if (msg.t === "to-server") {
          fromClient.publish({
            clientId: ws.data.clientId,
            sessionId: ws.data.sessionId,
            msgs: msg.msgs,
          });
          return;
        }
      },
      open(ws: ServerWebSocket<ServerWebSocketData>) {
        clients.set(ws.data.clientId, ws);

        ws.send(
          JSON.stringify({ t: "session-id", sessionId: ws.data.sessionId })
        );

        wire.publish({
          t: "client-connected",
          clientId: ws.data.clientId,
          sessionId: ws.data.sessionId,
        });
      },
      close(ws: ServerWebSocket<ServerWebSocketData>, code, message) {
        clients.delete(ws.data.clientId);
        wire.publish({
          t: "client-disconnected",
          clientId: ws.data.clientId,
          sessionId: ws.data.sessionId,
        });
      },
      drain(ws) {
        console.log("drain");
      },
    },
  });

  console.log(`[server] Listening on port ${port}`);

  const send = (
    ws: ServerWebSocket<ServerWebSocketData>,
    msg: ServerToClientMsg<ToClient>
  ) => {
    if (msg.t === "to-client" && msg.msgs.length === 0) {
      return;
    }

    if (ws.readyState === 1) {
      ws.send(JSON.stringify(msg));
      return;
    }
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
