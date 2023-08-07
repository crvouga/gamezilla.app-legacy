import {
  ClientToServerEvents,
  SESSION_ID_KEY,
  ServerToClientEvents,
  ToClient,
  ToServer,
} from "@gamezilla/app";
import { ClientId, SessionId, TransportServer } from "@gamezilla/core";
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

  let onClientMsg: (
    clientId: ClientId,
    sessionId: SessionId,
    msg: ToServer
  ) => void = () => {};
  let onDisconnect: (
    clientId: ClientId,
    sessionId: SessionId
  ) => void = () => {};
  let onConnect: (clientId: ClientId, sessionId: SessionId) => void = () => {};

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
    onConnect(clientId, sessionId);

    socket.on("to-server", (msg) => {
      onClientMsg(clientId, sessionId, msg);
    });

    socket.on("disconnect", () => {
      onDisconnect(clientId, sessionId);
    });
  });

  return {
    onClientMsg: (cb) => {
      onClientMsg = cb;
    },
    onDisconnect: (cb) => {
      onDisconnect = cb;
    },
    onConnect: (cb) => {
      onConnect = cb;
    },
    broadcast: (msg) => {
      io.emit("to-client", msg);
    },
    sendToClient: (clientIds: ClientId[], msg: ToClient) => {
      io.to(clientIds).emit("to-client", msg);
    },
  };
};
