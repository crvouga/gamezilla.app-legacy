import { ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Server } from "socket.io";
import { ClientMsgToServerMsg, ServerMsgToClientMsg } from "../transport.core";
import {
  IServerTransport,
  ServerTransportSocketIOImpl,
  initServerTransport,
} from "./transport-server";
import { PUBLIC_APP_CONFIG } from "config";

export const ServerTransportSocketIO = <MsgToServer, MsgToClient>({
  impl,
  codebaseVersionId,
}: {
  codebaseVersionId: string;
  impl: ServerTransportSocketIOImpl;
}): IServerTransport<{
  MsgToClient: MsgToClient;
  MsgToServer: MsgToServer;
}> => {
  const transport = initServerTransport<MsgToServer, MsgToClient>();

  const io = new Server(impl.serverPort, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
    allowUpgrades: true,
  });

  transport.wire.publish({ t: "server-started", port: impl.serverPort });

  io.on("connection", (socket) => {
    const maybeSessionId = socket.handshake.auth["sessionId"];

    const sessionId = SessionId.is(maybeSessionId)
      ? maybeSessionId
      : SessionId.generate();

    const toClient: ServerMsgToClientMsg<MsgToClient> = {
      t: "session-id",
      codebaseVersionId,
      sessionId,
    };
    socket.emit("to-client", toClient);

    const clientId = socket.id as ClientId;

    transport.wire.publish({ t: "client-connected", clientId, sessionId });

    socket.on("to-server", (msg: ClientMsgToServerMsg<MsgToServer>) => {
      if (
        msg.codebaseVersionId !== codebaseVersionId &&
        PUBLIC_APP_CONFIG.IS_PROD
      ) {
        transport.wire.publish({
          t: "got-bad-msgs",
          clientId,
          msgs: msg.msgs,
          reason: "codebase-version-id-mismatch",
          sessionId,
        });
        return;
      }

      transport.toServer.publish({
        msgs: msg.msgs,
        clientId: clientId,
        sessionId: sessionId,
      });
    });

    const unsubscribe = transport.toClient.subscribe((msgsByClientId) => {
      const msgs = msgsByClientId[clientId];

      if (!msgs) {
        return;
      }

      const toClient: ServerMsgToClientMsg<MsgToClient> = {
        t: "to-client",
        codebaseVersionId,
        msgs: msgs.msgs,
      };

      socket.emit("to-client", toClient);
    });

    socket.on("disconnect", () => {
      unsubscribe();

      transport.wire.publish({ t: "client-disconnected", clientId, sessionId });
    });
  });

  transport.toClientBroadcast.subscribe((msgs) => {
    const toClient: ServerMsgToClientMsg<MsgToClient> = {
      t: "to-client",
      codebaseVersionId,
      msgs: msgs,
    };

    io.emit("to-client", toClient);
  });

  return transport;
};
