import { SESSION_ID_KEY, ToClient, ToServer } from "@gamezilla/app";
import { ClientWireMsg, PubSub, TransportClient } from "@gamezilla/core";

const RECONNECT_INTERVAL = 1000; // 1 second
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
    };

    socketClient.onerror = () => {
      onWireMsg.publish({ t: "server-connect-error" });
    };

    socketClient.onclose = () => {
      onWireMsg.publish({ t: "server-disconnected" });
      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
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

  return {
    sendToServer: (msg) => () => {
      socketClient.send(JSON.stringify({ type: "to-server", payload: msg }));
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

  return baseServerUrlObj.href;
};
