import { PubSub } from "../../../@SHARED/core/sub";
import {
  ClientToServerMsg,
  ClientWireMsg,
  ServerToClientMsg,
} from "./wire-core";

const SESSION_ID_KEY = "gamezilla-session-id";

const RECONNECT_INTERVAL = 2000; // 1 second
const MAX_RECONNECT_ATTEMPTS = 5; // Adjust as needed

export const attachClientTransport = <ToServer, ToClient>({
  baseServerUrl,
  wire,
  fromServer,
  toServer,
}: {
  baseServerUrl: string;
  wire: PubSub<ClientWireMsg>;
  toServer: PubSub<ToServer[]>;
  fromServer: PubSub<ToClient[]>;
}) => {
  const serverUrl = toWebsocketServerUrl(baseServerUrl);

  let reconnectAttempts = 0;
  let ws: WebSocket;
  let isConnected = false;
  let isDocumentHidden = false;
  let queue: ClientToServerMsg<ToServer>[] = [];

  const connect = () => {
    if (isConnected) {
      return;
    }
    isConnected = true;
    ws = new WebSocket(serverUrl);

    ws.onopen = () => {
      reconnectAttempts = 0;
      wire.publish({ t: "server-connected" });
      for (const msg of queue) {
        send(msg);
      }
      queue = [];
    };

    ws.onerror = () => {
      wire.publish({ t: "server-connect-error" });
    };

    ws.onclose = () => {
      isConnected = false;
      if (isDocumentHidden) {
        console.log("closed socket because document is hidden");
        return;
      }

      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        wire.publish({ t: "server-disconnected" });
        console.log("server disconnected. max reconnect attempts reached");
        return;
      }
      reconnectAttempts++;
      setTimeout(connect, RECONNECT_INTERVAL);
      return;
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as ServerToClientMsg<ToClient>; // leap of faith

      if (msg.t === "to-client") {
        fromServer.publish(msg.msgs);
        return;
      }

      if (msg.t === "session-id") {
        localStorage.setItem(SESSION_ID_KEY, msg.sessionId);
        return;
      }
    };
  };

  connect();

  let closeTimeout: ReturnType<typeof setTimeout> | null = null;
  document.addEventListener("visibilitychange", () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }

    if (document.hidden) {
      isDocumentHidden = true;
      closeTimeout = setTimeout(() => {
        ws.close();
      }, 5000);
      return;
    }
    isDocumentHidden = false;
    connect();
  });

  const send = (msg: ClientToServerMsg<ToServer>) => {
    if (!isConnected) {
      queue.push(msg);
      queue = queue.slice(-100);
      return;
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
      return;
    }
  };

  toServer.subscribe((msgs) => {
    send({ t: "to-server", msgs });
  });
};

const toWebsocketServerUrl = (baseServerUrl: string) => {
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
