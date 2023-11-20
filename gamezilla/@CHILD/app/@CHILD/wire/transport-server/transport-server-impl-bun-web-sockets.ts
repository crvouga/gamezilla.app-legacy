import { ServerWebSocket } from "bun";
import { ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ClientToServerMsg, ServerToClientMsg } from "../transport.core";
import { IServerTransport, initServerTransport } from "./transport-server";

type ServerWebSocketData = {
  clientId: ClientId;
  sessionId: SessionId;
};

export const ServerTransportBunWebSockets = <
  ToServer,
  ToClient
>(): IServerTransport<{
  ToClient: ToClient;
  ToServer: ToServer;
}> => {
  //
  //
  //
  //

  const transport = initServerTransport<ToServer, ToClient>();

  //
  //
  //
  //
  //
  const clients = new Map<ClientId, ServerWebSocket<ServerWebSocketData>>();

  const port = Number(process.env["PORT"]) || 5000;

  const server = Bun.serve({
    port: port,

    fetch(req, server) {
      const url = new URL(req.url);

      switch (url.pathname) {
        case "/ws": {
          const maybeSessionId = url.searchParams.get("session-id");

          const sessionId = SessionId.is(maybeSessionId)
            ? maybeSessionId
            : SessionId.generate();

          const clientId = ClientId.generate();

          const data: ServerWebSocketData = {
            clientId,
            sessionId,
          };

          const didUpgrade = server.upgrade(req, {
            headers: {
              "Set-Cookie": `session-id=${sessionId}; SameSite=None; Secure`,
            },
            data,
          });

          if (didUpgrade) {
            return;
          }
          return new Response("Upgrade failed :(", { status: 500 });
        }

        default: {
          return new Response("Hello from gamezilla server", { status: 404 });
        }
      }
    },

    websocket: {
      message(ws: ServerWebSocket<ServerWebSocketData>, message) {
        const msg = JSON.parse(
          message.toString()
        ) as ClientToServerMsg<ToServer>; // leap of faith

        if (msg.t === "to-server") {
          transport.toServer.publish({
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

        transport.wire.publish({
          t: "client-connected",
          clientId: ws.data.clientId,
          sessionId: ws.data.sessionId,
        });
      },
      close(ws: ServerWebSocket<ServerWebSocketData>, code, message) {
        clients.delete(ws.data.clientId);
        transport.wire.publish({
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

  transport.topicPublish.subscribe((msg) => {
    for (const topic of msg.topics) {
      server.publish(topic, JSON.stringify(msg.msg));
    }
  });

  transport.topicSubscribe.subscribe((msg) => {
    const client = clients.get(msg.clientId);
    if (!client) {
      return;
    }
    for (const topic of msg.topics) {
      client.subscribe(topic);
    }
  });

  transport.wire.publish({
    t: "server-started",
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

  transport.toClientBroadcast.subscribe((msgs) => {
    for (const client of clients.values()) {
      send(client, { t: "to-client", msgs });
    }
  });

  transport.toClient.subscribe((toClient) => {
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

  return transport;
};
