import { ClientId, Eff, PubSub, SessionId, Sub } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ServerCmd, ServerEvt } from "gamezilla/@CHILD/app/@SHARED/server";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import {
  ServerModel,
  Session,
  ServerToClientMsg,
  ServerWireMsg,
  ClientToServerMsg,
} from "./wire.core";

export const update = ({
  msg,
  model,
}: {
  msg: ServerWireMsg;
  model: ServerModel;
}): {
  model: ServerModel;
  evt?: ServerEvt[];
} => {
  switch (msg.t) {
    case "client-connected": {
      const sessionId = msg.sessionId;
      const sessionNew: Session = {
        clientId: msg.clientId,
        sessionId,
      };

      return {
        model: {
          ...model,
          sessions: {
            ...model.sessions,
            [sessionNew.sessionId]: sessionNew,
          },
        },
        evt: [
          {
            ...msg,
            // userId: model.auth.sessions[msg.sessionId]?.userId,
            t: "client-connected",
          },
        ],
      };
    }

    case "client-disconnected": {
      const sessionNew: Session = {
        sessionId: msg.sessionId,
      };
      return {
        model: {
          ...model,
          sessions: {
            ...model.sessions,
            [sessionNew.sessionId]: sessionNew,
          },
        },
      };
    }
  }
};

export const updateFromCmd = <T>({
  model,
  msg,
}: {
  model: ServerModel;
  msg: ServerCmd<T>;
}): {
  model: ServerModel;
  eff?: Eff;
} => {
  switch (msg.t) {
    case "broadcast": {
      return { model };
    }
    case "send-to-client": {
      return { model };
    }
    case "send-to-user": {
      return { model };
    }
  }
};

const cmdToEff = (model: ServerModel, cmdList: ServerCmd<unknown>[]): Eff => {
  const broadcastMsgs: unknown[] = [];
  const toClientMsgs: {
    [clientId: ClientId]: {
      clientId: ClientId;
      msgs: unknown[];
    };
  } = {};

  for (const cmd of cmdList) {
    switch (cmd.t) {
      case "broadcast": {
        broadcastMsgs.push(cmd.msg);
        break;
      }
      case "send-to-client": {
        for (const clientId of cmd.clientIds) {
          toClientMsgs[clientId] = {
            clientId,
            msgs: [cmd.msg, ...(toClientMsgs[clientId]?.msgs ?? [])],
          };
        }
        break;
      }
      case "send-to-user": {
        const clientIds: ClientId[] = [];

        const userIdSet = new Set<UserId>(cmd.userIds);

        for (const sessionId in model.sessions) {
          if (!SessionId.is(sessionId)) {
            continue;
          }

          const session = model.sessions[sessionId];

          // const authSession = model.auth.sessions[sessionId];

          if (!session) {
            continue;
          }

          // if (!authSession) {
          //   continue;
          // }

          // if (!userIdSet.has(authSession.userId)) {
          //   continue;
          // }

          if (!session.clientId) {
            continue;
          }

          clientIds.push(session.clientId);
        }

        for (const clientId of clientIds) {
          toClientMsgs[clientId] = {
            clientId,
            msgs: [cmd.msg, ...(toClientMsgs[clientId]?.msgs ?? [])],
          };
        }

        break;
      }
    }
  }

  return () => {
    toClientBroadcast.publish(broadcastMsgs);
    toClient.publish(toClientMsgs);
  };
};

export const toClient = Sub.create<{
  [clientId: ClientId]: {
    clientId: ClientId;
    msgs: unknown[];
  };
}>();

export const toClientBroadcast = Sub.create<unknown[]>();

export const fromClient = Sub.create<{
  sessionId: SessionId;
  clientId: ClientId;
  msgs: unknown[];
}>();

export const wire = Sub.create<ServerWireMsg>();

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
