import { io } from "socket.io-client";
import { ClientMsgToServerMsg, ServerMsgToClientMsg } from "../transport.core";
import {
  ClientTransportSocketIOImpl,
  IClientTransport,
  initClientTransport,
} from "./transport-client";
import { PUBLIC_APP_CONFIG } from "config";

const SESSION_ID_KEY = "gamezilla-session-id";

export const ClientTransportSocketIO = <MsgToServer, MsgToClient>({
  codebaseVersionId,
  impl,
}: {
  codebaseVersionId: string;
  impl: ClientTransportSocketIOImpl;
}): IClientTransport<{
  MsgToServer: MsgToServer;
  MsgToClient: MsgToClient;
}> => {
  const transport = initClientTransport<MsgToServer, MsgToClient>();

  const socket = io(impl.serverUrl, {
    auth: {
      sessionId: localStorage.getItem(SESSION_ID_KEY) ?? null,
    },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    transport.msgEvt.publish({ t: "server-connected" });
  });

  socket.on("connect_error", () => {
    transport.msgEvt.publish({ t: "server-connect-error" });
  });

  socket.on("disconnect", () => {
    transport.msgEvt.publish({ t: "server-disconnected" });
  });

  transport.toServer.subscribe((msgs) => {
    const toServer: ClientMsgToServerMsg<MsgToServer> = {
      t: "to-server",
      msgs,
      codebaseVersionId,
    };

    socket.emit("to-server", toServer);
  });

  socket.on("to-client", (msg: ServerMsgToClientMsg<MsgToClient>) => {
    if (
      msg.codebaseVersionId !== codebaseVersionId &&
      PUBLIC_APP_CONFIG.IS_PROD
    ) {
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

  transport.msgCmd.subscribe((msgCmd) => {
    switch (msgCmd.t) {
      case "try-reconnect": {
        socket.connect();
        break;
      }
      default: {
        const _exhaustiveCheck: never = msgCmd.t;
        return _exhaustiveCheck;
      }
    }
  });

  return transport;
};
