import { createAdapter } from "@socket.io/postgres-adapter"
import { ClientId, SessionId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { ServerNode } from "gamezilla-app/@SHARED/server/server-impl-node/server-impl-node"
import pg from "pg"
import { Server } from "socket.io"
import { MsgClientToMsgServer, MsgServerToMsgClient } from "../transport.core"
import { IServerTransport, initServerTransport } from "./transport-server"

export const ServerTransportSocketIO = async <MsgToServer, MsgToClient>({
  server,
  codebaseVersionId,
  databaseUrl,
}: {
  codebaseVersionId: string
  server: ServerNode
  databaseUrl: string
}): Promise<
  IServerTransport<{
    MsgToClient: MsgToClient
    MsgToServer: MsgToServer
  }>
> => {
  const transport = initServerTransport<MsgToServer, MsgToClient>()

  const io = new Server(server.httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
    allowUpgrades: true,
  })

  const pool = new pg.Pool({
    connectionString: databaseUrl,
  })

  pool.query(`
  CREATE TABLE IF NOT EXISTS socket_io_attachments (
      id          bigserial UNIQUE,
      created_at  timestamptz DEFAULT NOW(),
      payload     bytea
  );
`)

  pool.on("error", (err) => {
    console.error("Postgres error", err)
  })

  io.adapter(createAdapter(pool))

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

    socket.on(
      "to-server",
      (msg: MsgClientToMsgServer<MsgToServer>, acknowledge: Function) => {
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

        acknowledge()
      },
    )

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
