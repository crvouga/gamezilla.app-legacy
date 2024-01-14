import { io } from "socket.io-client";
import { ClientToServerMsg, ServerToClientMsg } from "../transport.core";
import {
  ClientTransportSocketIOImpl,
  IClientTransport,
  initClientTransport,
} from "./transport-client";

const SESSION_ID_KEY = "gamezilla-session-id";

export const ClientTransportSocketIO = <ToServer, ToClient>({
  codebaseVersionId,
  impl,
}: {
  codebaseVersionId: string;
  impl: ClientTransportSocketIOImpl;
}): IClientTransport<{ ToServer: ToServer; ToClient: ToClient }> => {
  const transport = initClientTransport<ToServer, ToClient>();

  const socket = io(impl.serverUrl, {
    auth: {
      sessionId: localStorage.getItem(SESSION_ID_KEY) ?? null,
    },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    transport.event.publish({ t: "server-connected" });
  });

  socket.on("connect_error", () => {
    transport.event.publish({ t: "server-connect-error" });
  });

  socket.on("disconnect", () => {
    transport.event.publish({ t: "server-disconnected" });
  });

  transport.toServer.subscribe((msgs) => {
    const toServer: ClientToServerMsg<ToServer> = {
      t: "to-server",
      msgs,
      codebaseVersionId,
    };

    socket.emit("to-server", toServer);
  });

  socket.on("to-client", (msg: ServerToClientMsg<ToClient>) => {
    if (msg.codebaseVersionId !== codebaseVersionId) {
      console.error("Codebase version mismatch");
      return;
    }

    switch (msg.t) {
      case "session-id": {
        localStorage.setItem(SESSION_ID_KEY, msg.sessionId);
        break;
      }

      case "to-client": {
        transport.toClient.publish(msg.msgs);
        break;
      }
    }
  });

  transport.cmd.subscribe((cmd) => {
    switch (cmd.t) {
      case "try-reconnect": {
        socket.connect();
        break;
      }
      default: {
        const _exhaustiveCheck: never = cmd.t;
        return _exhaustiveCheck;
      }
    }
  });

  return transport;
};
