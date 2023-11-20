import { ServerWebSocket } from "bun";
import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvt,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Posix, TimeSpan, chain } from "gamezilla/@SHARED/core";
import { PubSub } from "gamezilla/@SHARED/core/sub";
import {
  Client,
  ClientToServerMsg,
  ServerModel,
  ServerMsg,
  ServerToClientMsg,
  ToClient,
  ToServer,
} from "./wire.core";

//
//
//
//
//
//
//

export const init = (): { model: ServerModel } => {
  return {
    model: {
      clientsBySessionId: {},
      serverStartedAt: null,
    },
  };
};

export const update = ({
  msg,
  model,
  ctx,
}: {
  ctx: ServerCtx;
  model: ServerModel;
  msg: ServerMsg;
}): {
  model: ServerModel;
  evt?: ServerEvt[];
  cmd?: ServerCmd<ToClient>[];
} => {
  switch (msg.t) {
    case "client-connected": {
      return chain(
        { model },
        (model) => {
          const clientNew: Client = {
            sessionId: msg.sessionId,
            clientId: msg.clientId,
            status: "connected",
          };
          const clientsBySessionIdNew: ServerModel["clientsBySessionId"] = {
            ...model.clientsBySessionId,
            [msg.sessionId]: clientNew,
          };

          return {
            model: {
              ...model,
              clientsBySessionId: clientsBySessionIdNew,
            },
            evt: [
              {
                t: "wire/client-connected",
                clientId: msg.clientId,
                sessionId: msg.sessionId,
              },
            ],
          };
        },
        (model) => {
          const didServerRestart =
            model.serverStartedAt &&
            TimeSpan.lte(
              Posix.diff(ctx.now, model.serverStartedAt),
              TimeSpan.fromSeconds(3)
            );

          if (didServerRestart) {
            return {
              model,
              cmd: [sendToClient([msg.clientId], { t: "server-restarted" })],
            };
          }

          return { model };
        }
      );
    }

    case "client-disconnected": {
      const clientNew: Client = {
        sessionId: msg.sessionId,
        clientId: msg.clientId,
        status: "disconnected",
      };
      const clientsBySessionIdNew: ServerModel["clientsBySessionId"] = {
        ...model.clientsBySessionId,
        [msg.sessionId]: clientNew,
      };
      return {
        model: {
          ...model,
          clientsBySessionId: clientsBySessionIdNew,
        },
        evt: [
          {
            t: "wire/client-disconnected",
            clientId: msg.clientId,
            sessionId: msg.sessionId,
          },
        ],
      };
    }

    case "server-started": {
      return {
        model: {
          ...model,
          serverStartedAt: ctx.now,
        },
      };
    }
  }
};

export const updateFromClient = ({
  model,
  msg,
}: {
  model: ServerModel;
  msg: ToServer;
}): {
  model: ServerModel;
} => {
  return { model };
};

export const updateFromCmd = <ToClient>({
  cmd,
  model,
  sessionIdByUserId,
  toClient,
  toClientBroadcast,
}: {
  cmd: ServerCmd<ToClient>;
  model: ServerModel;
  sessionIdByUserId: { [userId: UserId]: SessionId };
  toClient: PubSub<{
    [clientId: ClientId]: {
      clientId: ClientId;
      msgs: ToClient[];
    };
  }>;
  toClientBroadcast: PubSub<ToClient[]>;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
} => {
  switch (cmd.t) {
    case "wire/broadcast": {
      return {
        model,
        eff: () => {
          toClientBroadcast.publish([cmd.msg]);
        },
      };
    }

    case "wire/send-to-client": {
      return {
        model,
        eff: () => {
          const toClientPayload: {
            [clientId: ClientId]: {
              clientId: ClientId;
              msgs: ToClient[];
            };
          } = {};

          for (const clientId of cmd.clientIds) {
            toClientPayload[clientId] = {
              clientId,
              msgs: [cmd.msg],
            };
          }

          toClient.publish(toClientPayload);
        },
      };
    }

    case "wire/send-to-user": {
      return {
        model,
        eff: () => {
          const toClientPayload: {
            [clientId: ClientId]: {
              clientId: ClientId;
              msgs: ToClient[];
            };
          } = {};

          for (const userId of cmd.userIds) {
            const sessionId = sessionIdByUserId[userId];
            if (!sessionId) {
              continue;
            }
            const client = model.clientsBySessionId[sessionId];
            if (!client) {
              continue;
            }
            toClientPayload[client.clientId] = {
              clientId: client.clientId,
              msgs: [cmd.msg],
            };
          }

          toClient.publish(toClientPayload);
        },
      };
    }

    case "wire/publish": {
      return { model };
    }

    case "wire/subscribe": {
      return { model };
    }

    default: {
      return { model };
    }
  }
};

const wire = PubSub.create<ServerMsg>();

export const subscriptions = wire;

//
//
//
//
//
//
//
//
//

type ServerWebSocketData = {
  clientId: ClientId;
  sessionId: SessionId;
};

export const createTransport = <ToServer, ToClient>() => {
  //
  //
  //
  //

  const toClient = PubSub.create<{
    [clientId: ClientId]: {
      clientId: ClientId;
      msgs: ToClient[];
    };
  }>();

  const toClientBroadcast = PubSub.create<ToClient[]>();

  const toServer = PubSub.create<{
    msgs: ToServer[];
    clientId: ClientId;
    sessionId: SessionId;
  }>();

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
          toServer.publish({
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

  wire.publish({
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

  return {
    toClient,
    toClientBroadcast,
    toServer,
  };
};
