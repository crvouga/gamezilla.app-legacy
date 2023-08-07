import {
  ClientToServerEvents,
  SESSION_ID_KEY,
  ServerToClientEvents,
  ToClient,
  ToServer,
} from "@gamezilla/app";
import { ClientId, SessionId, Sub, TransportServer } from "@gamezilla/core";
import { Server as HttpServer } from "http";
import { Server as SocketIoServer } from "socket.io";

export const createTransportServer = (
  httpServer: HttpServer
): TransportServer<ToClient, ToServer> => {
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

  const onClientMsg = Sub.create<{
    clientId: ClientId;
    sessionId: SessionId;
    msg: ToServer;
  }>();

  const onDisconnect = Sub.create<{
    clientId: ClientId;
    sessionId: SessionId;
  }>();

  const onConnect = Sub.create<{
    clientId: ClientId;
    sessionId: SessionId;
  }>();

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

    onConnect.publish({ clientId, sessionId });

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

      onDisconnect.publish({ clientId, sessionId });
    });
  });

  return {
    onClientMsg,
    onDisconnect,
    onConnect,
    broadcast: (msg) => () => {
      io.emit("to-client", msg);
    },
    sendToClient: (clientIds: ClientId[], msg: ToClient) => () => {
      io.to(clientIds).emit("to-client", msg);
    },
  };
};
