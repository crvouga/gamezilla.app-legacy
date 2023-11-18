import { ServerWebSocket } from "bun";
import { UserId, ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ServerCmd, ServerEvt } from "gamezilla/@CHILD/app/@SHARED/server";
import { PubSub } from "gamezilla/@SHARED/core/sub";
import { Eff } from "gamezilla/@SHARED/core";
import {
  Client,
  ClientToServerMsg,
  ServerModel,
  ServerMsg,
  ServerToClientMsg,
  ServerWireMsg,
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
    },
  };
};

export const update = ({
  msg,
  model,
}: {
  model: ServerModel;
  msg: ServerMsg;
}): {
  model: ServerModel;
  evt?: ServerEvt[];
} => {
  switch (msg.t) {
    case "client-connected": {
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
        evt: [msg],
      };
    }

    case "client-disconnected": {
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
        evt: [msg],
      };
    }
  }
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

          const userIds = new Set<UserId>();
          for (const userId of cmd.userIds) {
            const sessionId = usersBySessionId[userId].sessionId;
          }
        },
      };
    }

    default: {
      return { model };
    }
  }
};

const wire = PubSub.create<ServerWireMsg>();

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

  Bun.serve({
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
