import { ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Server } from "socket.io";
import { ClientToServerMsg, ServerToClientMsg } from "../transport.core";
import {
  IServerTransport,
  ServerTransportSocketIOImpl,
  initServerTransport,
} from "./transport-server";

export const ServerTransportSocketIO = <ToServer, ToClient>({
  impl,
  codebaseVersionId,
}: {
  codebaseVersionId: string;
  impl: ServerTransportSocketIOImpl;
}): IServerTransport<{
  ToClient: ToClient;
  ToServer: ToServer;
}> => {
  const transport = initServerTransport<ToServer, ToClient>();

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

    const toClient: ServerToClientMsg<ToClient> = {
      t: "session-id",
      codebaseVersionId,
      sessionId,
    };
    socket.emit("to-client", toClient);

    const clientId = socket.id as ClientId;

    transport.wire.publish({ t: "client-connected", clientId, sessionId });

    socket.on("to-server", (msg: ClientToServerMsg<ToServer>) => {
      if (msg.codebaseVersionId !== codebaseVersionId) {
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

      const toClient: ServerToClientMsg<ToClient> = {
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
    const toClient: ServerToClientMsg<ToClient> = {
      t: "to-client",
      codebaseVersionId,
      msgs: msgs,
    };

    io.emit("to-client", toClient);
  });

  return transport;
};
