import {
  ClientToServerEvents,
  ServerToClientEvents,
  SESSION_ID_KEY,
  ToClient,
  ToServer,
} from "@gamezilla/app";
import { Sub, TransportClient } from "@gamezilla/core";
import { io, Socket } from "socket.io-client";

export const createTransportClient = (
  serverUrl: string
): TransportClient<ToClient, ToServer> => {
  const socketClient: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    serverUrl,
    {
      auth: {
        [SESSION_ID_KEY]: localStorage.getItem(SESSION_ID_KEY) ?? undefined,
      },
      forceNew: true,
    }
  );

  const onServerMsg = Sub.create<ToClient>();
  const onConnect = Sub.create<void>();
  const onDisconnect = Sub.create<void>();
  const onConnectError = Sub.create<void>();

  socketClient.on("session-id", (sessionId) => {
    console.log(`session-id: ${sessionId}`);
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  });

  socketClient.on("connect", () => {
    onConnect.publish();
  });

  socketClient.on("disconnect", () => {
    onDisconnect.publish();
  });

  socketClient.on("connect_error", () => {
    onConnectError.publish();
  });

  socketClient.on("to-client", (msg) => {
    onServerMsg.publish(msg);
  });

  return {
    sendToServer: (msg) => () => {
      console.log("sending to server", msg);
      socketClient.emit("to-server", msg);
    },
    onServerMsg,
    onConnect,
    onDisconnect,
    onConnectError,
  };
};
