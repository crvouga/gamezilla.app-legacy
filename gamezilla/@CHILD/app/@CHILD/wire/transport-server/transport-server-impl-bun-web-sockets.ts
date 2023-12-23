import { ServerWebSocket } from "bun";
import { ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ClientToServerMsg, ServerToClientMsg } from "../transport.core";
import {
  IServerTransport,
  ServerTransportWebSocketImpl,
  initServerTransport,
} from "./transport-server";

type ServerWebSocketData = {
  clientId: ClientId;
  sessionId: SessionId;
};

export const ServerTransportBunWebSockets = <ToServer, ToClient>({
  impl,
  codebaseVersionId,
}: {
  codebaseVersionId: string;
  impl: ServerTransportWebSocketImpl;
}): IServerTransport<{
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
  const clientsBySessionId = new Map<SessionId, Set<ClientId>>();
  const addClient = (ws: ServerWebSocket<ServerWebSocketData>) => {
    clients.set(ws.data.clientId, ws);
    const clientIds = clientsBySessionId.get(ws.data.sessionId) ?? new Set();
    clientIds.add(ws.data.clientId);
    clientsBySessionId.set(ws.data.sessionId, clientIds);
  };

  const server = Bun.serve({
    port: impl.serverPort,

    fetch(req, server) {
      const url = new URL(req.url);

      switch (url.pathname) {
        case impl.endpoint: {
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

        switch (msg.t) {
          case "to-server": {
            if (msg.codebaseVersionId !== codebaseVersionId) {
              console.error(
                `Client ${ws.data.clientId} is using codebase version ${msg.codebaseVersionId} but server is using ${codebaseVersionId}`
              );
              return;
            }

            transport.toServer.publish({
              clientId: ws.data.clientId,
              sessionId: ws.data.sessionId,
              msgs: msg.msgs,
            });
            return;
          }
        }
      },
      open(ws: ServerWebSocket<ServerWebSocketData>) {
        addClient(ws);
        send(ws, {
          t: "session-id",
          codebaseVersionId,
          sessionId: ws.data.sessionId,
        });

        transport.wire.publish({
          t: "client-connected",
          clientId: ws.data.clientId,
          sessionId: ws.data.sessionId,
        });
      },
      close(ws: ServerWebSocket<ServerWebSocketData>, _code, _message) {
        transport.wire.publish({
          t: "client-disconnected",
          clientId: ws.data.clientId,
          sessionId: ws.data.sessionId,
        });
      },
      drain(_ws) {
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

  transport.wire.publish({ t: "server-started" });

  console.log(`[server] Listening on port ${impl.serverPort}`);

  const send = (
    ws: ServerWebSocket<ServerWebSocketData>,
    msg: ServerToClientMsg<ToClient>
  ) => {
    switch (ws.readyState) {
      case 1: {
        if (msg.t === "to-client" && msg.msgs.length === 0) {
          return;
        }
        ws.send(JSON.stringify(msg));
        return;
      }
      default: {
        return;
      }
    }
  };

  transport.toClientBroadcast.subscribe((msgs) => {
    for (const client of clients.values()) {
      send(client, { t: "to-client", msgs, codebaseVersionId });
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

      send(client, {
        t: "to-client",
        msgs: toClientSingle.msgs,
        codebaseVersionId,
      });
    }
  });

  return transport;
};
