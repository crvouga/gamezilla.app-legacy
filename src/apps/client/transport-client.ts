import { SESSION_ID_KEY, ToClient, ToServer } from "@gamezilla/app";
import { ClientWireMsg, PubSub, TransportClient } from "@gamezilla/core";

export const createTransportClient = ({
  baseServerUrl,
  onWireMsg,
  onServerMsg,
}: {
  baseServerUrl: string;
  onWireMsg: PubSub<ClientWireMsg>;
  onServerMsg: PubSub<ToClient>;
}): TransportClient<ToClient, ToServer> => {
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
  const serverUrl = baseServerUrlObj.href;

  const socketClient = new WebSocket(serverUrl);

  socketClient.onopen = () => {
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
  };

  socketClient.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === "session-id") {
      console.log(`session-id: ${msg.sessionId}`);
      localStorage.setItem(SESSION_ID_KEY, msg.sessionId);
    } else if (msg.type === "to-client") {
      onServerMsg.publish(msg.payload);
    }
  };

  return {
    sendToServer: (msg) => () => {
      socketClient.send(JSON.stringify({ type: "to-server", payload: msg }));
    },
    onServerMsg,
    onWireMsg,
  };
};
