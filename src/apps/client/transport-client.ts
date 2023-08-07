import { SESSION_ID_KEY, ToClient, ToServer } from "@gamezilla/app";
import { ClientWireMsg, PubSub, TransportClient } from "@gamezilla/core";

const RECONNECT_INTERVAL = 2000; // 1 second
const MAX_RECONNECT_ATTEMPTS = 5; // Adjust as needed

export const createTransportClient = ({
  baseServerUrl,
  onWireMsg,
  onServerMsg,
}: {
  baseServerUrl: string;
  onWireMsg: PubSub<ClientWireMsg>;
  onServerMsg: PubSub<ToClient>;
}): TransportClient<ToClient, ToServer> => {
  let reconnectAttempts = 0;
  const serverUrl = createServerUrl(baseServerUrl);
  let socketClient: WebSocket;
  const queue: ToServer[] = [];

  let tryReconnect = true;

  const connect = () => {
    socketClient = new WebSocket(serverUrl);

    socketClient.onopen = () => {
      reconnectAttempts = 0;
      const authMessage = JSON.stringify({
        type: "auth",
        [SESSION_ID_KEY]: localStorage.getItem(SESSION_ID_KEY) ?? undefined,
      });
      socketClient.send(authMessage);
      onWireMsg.publish({ t: "server-connected" });
      for (const msg of queue) {
        socketClient.send(JSON.stringify({ type: "to-server", payload: msg }));
      }
    };

    socketClient.onerror = () => {
      onWireMsg.publish({ t: "server-connect-error" });
    };

    socketClient.onclose = () => {
      if (!tryReconnect) {
        onWireMsg.publish({ t: "server-disconnected" });
        console.log("Server disconnected. Reconnects disabled.");
        return;
      }

      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        onWireMsg.publish({ t: "server-disconnected" });
        console.log("Max reconnect attempts reached.");
        return;
      }
      reconnectAttempts++;
      setTimeout(connect, RECONNECT_INTERVAL);
      return;
    };

    socketClient.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "session-id") {
        console.log(`session-id: ${msg.sessionId}`);
        localStorage.setItem(SESSION_ID_KEY, msg.sessionId);
        return;
      }

      if (msg.type === "to-client") {
        onServerMsg.publish(msg.payload);
      }
    };
  };

  connect();

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      tryReconnect = false;
      socketClient.close();
    } else {
      tryReconnect = true;
      connect();
    }
  });

  return {
    sendToServer: (msg) => () => {
      if (socketClient.readyState === WebSocket.OPEN) {
        socketClient.send(JSON.stringify({ type: "to-server", payload: msg }));
        return;
      }
      queue.push(msg);
    },
    onServerMsg,
    onWireMsg,
  };
};

const createServerUrl = (baseServerUrl: string) => {
  const baseServerUrlObj = new URL(baseServerUrl);
  const sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (sessionId) {
    baseServerUrlObj.searchParams.append("session-id", sessionId);
  }

  if (baseServerUrlObj.protocol === "https:") {
    baseServerUrlObj.protocol = "wss";
  }

  if (baseServerUrlObj.protocol === "http:") {
    baseServerUrlObj.protocol = "ws";
  }

  baseServerUrlObj.pathname = "/ws";

  return baseServerUrlObj.href;
};
