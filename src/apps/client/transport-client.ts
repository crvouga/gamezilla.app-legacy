import {
  ClientToServerEvents,
  ServerToClientEvents,
  SESSION_ID_KEY,
  ToClient,
  ToServer,
} from "@gamezilla/app";
import { TransportClient } from "@gamezilla/core";
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

  let onServerMsg: (msg: ToClient) => void = () => {};

  let onConnect: () => void = () => {};
  let onDisconnect: () => void = () => {};
  let onConnectError: () => void = () => {};

  socketClient.on("session-id", (sessionId) => {
    console.log(`session-id: ${sessionId}`);
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  });

  socketClient.on("connect", () => {
    onConnect();
  });

  socketClient.on("disconnect", () => {
    onDisconnect();
  });

  socketClient.on("connect_error", () => {
    onConnectError();
  });

  socketClient.on("to-client", (msg) => {
    onServerMsg(msg);
  });

  return {
    sendToServer: (msg) => {
      socketClient.emit("to-server", msg);
    },
    onServerMsg: (cb) => {
      onServerMsg = cb;
    },
    onConnect: (cb) => {
      onConnect = cb;
    },
    onDisconnect: (cb) => {
      onDisconnect = cb;
    },
    onConnectError: (cb) => {
      onConnectError = cb;
    },
  };
};
