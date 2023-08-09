import { ClientWireMsg, PubSub, SessionMsg, TransportClient } from "src/core";
import { ToClient, ToServer } from "./app";

const SESSION_ID_KEY = "gamezilla-session-id";

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
  const serverUrl = createServerUrl(baseServerUrl);

  let reconnectAttempts = 0;
  let ws: WebSocket;
  let isDocumentHidden = false;

  const connect = () => {
    ws = new WebSocket(serverUrl);

    ws.onopen = () => {
      reconnectAttempts = 0;
      onWireMsg.publish({ t: "server-connected" });
    };

    ws.onerror = () => {
      onWireMsg.publish({ t: "server-connect-error" });
    };

    ws.onclose = () => {
      if (isDocumentHidden) {
        // onWireMsg.publish({ t: "server-disconnected" });
        console.log("closed socket because document is hidden");
        return;
      }

      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        onWireMsg.publish({ t: "server-disconnected" });
        console.log("server disconnected. max reconnect attempts reached");
        return;
      }
      reconnectAttempts++;
      setTimeout(connect, RECONNECT_INTERVAL);
      return;
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as ToClient | SessionMsg;

      if (msg.t === "session-id") {
        localStorage.setItem(SESSION_ID_KEY, msg.sessionId);
        return;
      }

      onServerMsg.publish(msg);
    };
  };

  connect();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      isDocumentHidden = true;
      ws.close();
      return;
    }
    isDocumentHidden = false;
    connect();
  });

  return {
    sendToServer: (msg) => () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
        return;
      }
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
