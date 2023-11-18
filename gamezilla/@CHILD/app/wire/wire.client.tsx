import { Eff, PubSub } from "gamezilla/@SHARED/core";
import { ClientCmd, ClientEvt } from "gamezilla/@CHILD/app/@SHARED/client";
import { IconSpinner } from "gamezilla/@CHILD/app/@SHARED/ui";
import {
  ClientModel,
  ClientMsg,
  ClientToServerMsg,
  ClientWireMsg,
  ServerToClientMsg,
} from "./wire.core";

//
//
//
// Model
//
//
//

export const init = ({
  stored,
}: {
  stored: ClientModel | null;
}): { model: ClientModel } => {
  if (stored) {
    return {
      model: stored,
    };
  }
  return {
    model: {
      t: "server-connecting",
    },
  };
};

//
//
//
//  Update
//
//
//

export const update = ({
  msg,
  model,
}: {
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  evt?: ClientEvt[];
} => {
  switch (msg.t) {
    case "server-connect-error": {
      return {
        model: {
          t: "server-connect-error",
          errorCount:
            model.t === "server-connect-error" ? model.errorCount + 1 : 1,
        },
      };
    }

    case "server-connected": {
      return {
        model: {
          t: "server-connected",
        },
        evt: [{ t: "server-connected" }],
      };
    }

    case "server-disconnected": {
      return { model: { t: msg.t } };
    }
  }
};

export const updateFromCmd = <ToServer,>({
  cmd,
  model,
  toServer,
}: {
  cmd: ClientCmd<{ ClientMsg: never; ToServer: ToServer }>;
  model: ClientModel;
  toServer: PubSub<ToServer[]>;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} => {
  switch (cmd.t) {
    case "wire/send-to-server": {
      return {
        model,
        eff: () => {
          if (cmd.msg) {
            toServer.publish([cmd.msg]);
          }
        },
      };
      return { model };
    }
    default: {
      return { model };
    }
  }
};

//
//
//
// View
//
//
//

export const View = ({ model }: { model: ClientModel }) => {
  if (model.t === "server-connect-error" && model.errorCount > 2) {
    return (
      <div class="flex h-6 w-full items-center justify-center gap-2 bg-yellow-600 text-white">
        <IconSpinner class="h-5 w-5 animate-spin text-white" />
        Server disconnected. Trying to reconnect...
      </div>
    );
  }
  if (model.t === "server-disconnected") {
    return (
      <div class="flex h-6 w-full items-center justify-center gap-2 bg-red-500 text-white">
        Server disconnected
      </div>
    );
  }
  return null;
};

//
//
//
//
//
//

const wire = PubSub.create<ClientWireMsg>();

export const subscriptions = wire;

//
//
//
//
//
//
//
//
//
//
//
//

const SESSION_ID_KEY = "gamezilla-session-id";
const RECONNECT_INTERVAL = 2000; // 1 second
const MAX_RECONNECT_ATTEMPTS = 5; // Adjust as needed

export const attachClientTransport = <ToServer, ToClient>({
  baseServerUrl,
  toClient,
  toServer,
}: {
  baseServerUrl: string;
  toServer: PubSub<ToServer[]>;
  toClient: PubSub<ToClient[]>;
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
        toClient.publish(msg.msgs);
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

  return baseServerUrlObj.toString();
};
