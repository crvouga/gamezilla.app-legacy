import {
  ClientToServerEvents,
  ServerToClientEvents,
  SESSION_ID_KEY,
  ToClient,
  ToServer,
} from "@gamezilla/app";
import { ClientWireMsg, PubSub, TransportClient } from "@gamezilla/core";
import { io, Socket } from "socket.io-client";

export const createTransportClient = ({
  serverUrl,
  onWireMsg,
  onServerMsg,
}: {
  serverUrl: string;
  onWireMsg: PubSub<ClientWireMsg>;
  onServerMsg: PubSub<ToClient>;
}): TransportClient<ToClient, ToServer> => {
  const socketClient: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    serverUrl,
    {
      auth: {
        [SESSION_ID_KEY]: localStorage.getItem(SESSION_ID_KEY) ?? undefined,
      },
      forceNew: true,
    }
  );

  socketClient.on("session-id", (sessionId) => {
    console.log(`session-id: ${sessionId}`);
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  });

  socketClient.on("connect", () => {
    onWireMsg.publish({ t: "server-connected" });
  });

  socketClient.on("disconnect", () => {
    onWireMsg.publish({ t: "server-disconnected" });
  });

  socketClient.on("connect_error", () => {
    onWireMsg.publish({ t: "server-connect-error" });
  });

  socketClient.on("to-client", (msg) => {
    onServerMsg.publish(msg);
  });

  return {
    sendToServer: (msg) => () => {
      socketClient.emit("to-server", msg);
    },
    onServerMsg,
    onWireMsg,
  };
};
