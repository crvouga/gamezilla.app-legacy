import { ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data"
import { ServerNode } from "gamezilla/@SHARED/server/server-impl-node"
import { Server } from "socket.io"
import { MsgClientToMsgServer, MsgServerToMsgClient } from "../transport.core"
import { IServerTransport, initServerTransport } from "./transport-server"

export const ServerTransportSocketIO = <MsgToServer, MsgToClient>({
  server,
  codebaseVersionId,
}: {
  codebaseVersionId: string
  server: ServerNode
}): IServerTransport<{
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
}> => {
  const transport = initServerTransport<MsgToServer, MsgToClient>()

  const io = new Server(server.httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
    allowUpgrades: true,
  })

  io.on("connection", (socket) => {
    const maybeSessionId = socket.handshake.auth["sessionId"]

    const sessionId = SessionId.is(maybeSessionId)
      ? maybeSessionId
      : SessionId.generate()

    const toClient: MsgServerToMsgClient<MsgToClient> = {
      t: "session-id",
      codebaseVersionId,
      sessionId,
    }
    socket.emit("to-client", toClient)

    const clientId = socket.id as ClientId

    transport.wire.publish({ t: "client-connected", clientId, sessionId })

    socket.on("to-server", (msg: MsgClientToMsgServer<MsgToServer>) => {
      if (msg.codebaseVersionId !== codebaseVersionId) {
        transport.wire.publish({
          t: "got-bad-msgs",
          clientId,
          msgs: msg.msgs,
          reason: "codebase-version-id-mismatch",
          sessionId,
        })
      }

      transport.toServer.publish({
        msgs: msg.msgs,
        clientId: clientId,
        sessionId: sessionId,
      })
    })

    const unsubscribe = transport.toClient.subscribe((msgsByClientId) => {
      const msgs = msgsByClientId[clientId]

      if (!msgs) {
        return
      }

      const toClient: MsgServerToMsgClient<MsgToClient> = {
        t: "to-client",
        codebaseVersionId,
        msgs: msgs.msgs,
      }

      socket.emit("to-client", toClient)
    })

    socket.on("disconnect", () => {
      unsubscribe()

      transport.wire.publish({
        t: "client-disconnected",
        clientId,
        sessionId,
      })
    })
  })

  transport.toClientBroadcast.subscribe((msgs) => {
    const toClient: MsgServerToMsgClient<MsgToClient> = {
      t: "to-client",
      codebaseVersionId,
      msgs: msgs,
    }

    io.emit("to-client", toClient)
  })

  return transport
}
