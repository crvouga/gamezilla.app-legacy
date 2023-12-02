import { ClientToServerMsg, ServerToClientMsg } from "../transport.core";
import {
  ClientTransportWebSocketImpl,
  IClientTransport,
  initClientTransport,
} from "./transport-client";

const SESSION_ID_KEY = "gamezilla-session-id";
const RECONNECT_INTERVAL = 2000; // 1 second
const MAX_RECONNECT_ATTEMPTS = 6; // Adjust as needed

export const ClientTransportWebSockets = <ToServer, ToClient>({
  impl,
}: {
  impl: ClientTransportWebSocketImpl;
}): IClientTransport<{ ToServer: ToServer; ToClient: ToClient }> => {
  const serverUrl = toWebsocketServerUrl(impl.serverUrl);

  const transport = initClientTransport<ToServer, ToClient>();

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
      transport.evt.publish({ t: "server-connected" });
      for (const msg of queue) {
        send(msg);
      }
      queue = [];
    };

    ws.onerror = () => {
      transport.evt.publish({ t: "server-connect-error" });
    };

    ws.onclose = () => {
      isConnected = false;
      if (isDocumentHidden) {
        return;
      }

      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        transport.evt.publish({ t: "server-disconnected" });
        return;
      }
      reconnectAttempts++;
      setTimeout(connect, RECONNECT_INTERVAL);
      return;
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as ServerToClientMsg<ToClient>; // leap of faith

      if (msg.t === "to-client") {
        transport.toClient.publish(msg.msgs);
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
    if (document.hidden) {
      isDocumentHidden = true;
      if (ws) {
        ws.close(); // Close the WebSocket connection
        isConnected = false;
      }
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    } else {
      isDocumentHidden = false;
      connect(); // Re-establish the WebSocket connection when the page is shown again
    }
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

  transport.toServer.subscribe((msgs) => {
    send({ t: "to-server", msgs });
  });

  transport.cmd.subscribe((cmd) => {
    switch (cmd.t) {
      case "try-reconnect": {
        reconnectAttempts = 0;
        connect();
        break;
      }
    }
  });

  return transport;
};

function toWebsocketServerUrl(baseServerUrl: string) {
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

  return baseServerUrlObj.toString();
}
