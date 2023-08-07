import {
  ClientToServerEvents,
  SESSION_ID_KEY,
  ServerToClientEvents,
  ToClient,
  ToServer,
} from "@gamezilla/app";
import {
  ClientId,
  PubSub,
  ServerWireMsg,
  SessionId,
  TransportServer,
} from "@gamezilla/core";
import { Server as HttpServer } from "http";
import { Server as SocketIoServer } from "socket.io";

export const createTransportServer = ({
  httpServer,
  onClientMsg,
  onWireMsg,
}: {
  httpServer: HttpServer;
  onClientMsg: PubSub<{
    msg: ToServer;
    clientId: ClientId;
    sessionId: SessionId;
  }>;
  onWireMsg: PubSub<ServerWireMsg>;
}): TransportServer<ToClient, ToServer> => {
  const io = new SocketIoServer<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cors: {
        origin: "*",
        credentials: true,
      },
    }
  );

  io.on("connection", (socket) => {
    const maybeSessionId: unknown = socket.handshake.auth[SESSION_ID_KEY];

    const sessionId = SessionId.is(maybeSessionId)
      ? maybeSessionId
      : SessionId.generate();

    socket.emit("session-id", sessionId);

    const clientId = socket.id;

    if (!ClientId.is(clientId)) {
      return;
    }

    onWireMsg.publish({ t: "client-connected", clientId, sessionId });

    socket.on("to-server", (msg) => {
      const clientId = socket.id;

      if (!ClientId.is(clientId)) {
        return;
      }

      onClientMsg.publish({ clientId, sessionId, msg });
    });

    socket.on("disconnect", () => {
      const clientId = socket.id;

      if (!ClientId.is(clientId)) {
        return;
      }

      onWireMsg.publish({ t: "client-disconnected", clientId, sessionId });
    });
  });

  return {
    broadcast: (msg) => () => {
      io.emit("to-client", msg);
    },
    sendToClient: (clientIds: ClientId[], msg: ToClient) => () => {
      io.to(clientIds).emit("to-client", msg);
    },
    onClientMsg,
    onWireMsg,
  };
};
