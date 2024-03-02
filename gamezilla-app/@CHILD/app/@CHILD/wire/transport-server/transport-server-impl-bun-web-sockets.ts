import { Server, ServerWebSocket, WebSocketHandler } from "bun"
import { ClientId, SessionId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { ServerBun } from "gamezilla-app/@SHARED/server/server-impl-bun/server-impl-bun"
import { MsgClientToMsgServer, MsgServerToMsgClient } from "../transport.core"
import { IServerTransport, initServerTransport } from "./transport-server"

type ServerWebSocketData = {
  clientId: ClientId
  sessionId: SessionId
}

export const ServerTransportBunWebSockets = <MsgToServer, MsgToClient>({
  server,
  codebaseVersionId,
}: {
  codebaseVersionId: string
  server: ServerBun
}): IServerTransport<{
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
}> => {
  //
  //
  //
  // Output
  //
  //
  //

  const transport = initServerTransport<MsgToServer, MsgToClient>()

  //
  //
  //
  // State
  //
  //
  //

  const clients = new Map<ClientId, ServerWebSocket<ServerWebSocketData>>()
  const clientsBySessionId = new Map<SessionId, Set<ClientId>>()
  const addClient = (ws: ServerWebSocket<ServerWebSocketData>) => {
    clients.set(ws.data.clientId, ws)

    const clientIds = clientsBySessionId.get(ws.data.sessionId)

    if (!clientIds) {
      const clientIdsNew = new Set<ClientId>()
      clientIdsNew.add(ws.data.clientId)
      clientsBySessionId.set(ws.data.sessionId, clientIdsNew)
      return
    }

    clientIds.add(ws.data.clientId)
  }

  const removeClient = (ws: ServerWebSocket<ServerWebSocketData>) => {
    clients.delete(ws.data.clientId)

    const clientIds = clientsBySessionId.get(ws.data.sessionId)

    if (!clientIds) {
      return
    }

    clientIds.delete(ws.data.clientId)
  }

  //
  //
  //
  // Web Server
  //
  //
  //

  const onRequest = (req: Request, server: Server) => {
    const url = new URL(req.url)

    switch (url.pathname) {
      case "/ws": {
        const maybeSessionId = url.searchParams.get("session-id")

        const sessionId = SessionId.is(maybeSessionId)
          ? maybeSessionId
          : SessionId.generate()

        const clientId = ClientId.generate()

        const data: ServerWebSocketData = {
          clientId,
          sessionId,
        }

        const didUpgrade = server.upgrade(req, {
          headers: {
            "Set-Cookie": `session-id=${sessionId}; SameSite=None; Secure`,
          },
          data,
        })

        if (didUpgrade) {
          return
        }
        return new Response("Upgrade failed :(", { status: 500 })
      }

      default: {
        return null
      }
    }
  }

  const websocket: WebSocketHandler<ServerWebSocketData> = {
    open(ws: ServerWebSocket<ServerWebSocketData>) {
      addClient(ws)
      send(ws, {
        t: "session-id",
        codebaseVersionId,
        sessionId: ws.data.sessionId,
      })
      transport.wire.publish({
        t: "client-connected",
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId,
      })
    },
    close(ws: ServerWebSocket<ServerWebSocketData>, _code, _message) {
      removeClient(ws)
      transport.wire.publish({
        t: "client-disconnected",
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId,
      })
    },
    message(ws: ServerWebSocket<ServerWebSocketData>, message) {
      const msg = JSON.parse(
        message.toString(),
      ) as MsgClientToMsgServer<MsgToServer> // leap of faith

      switch (msg.codebaseVersionId) {
        case codebaseVersionId: {
          switch (msg.t) {
            case "to-server": {
              transport.toServer.publish({
                clientId: ws.data.clientId,
                sessionId: ws.data.sessionId,
                msgs: msg.msgs,
              })
              return
            }
            default: {
              transport.wire.publish({
                t: "got-bad-msgs",
                reason: "unknown-msg-type",
                clientId: ws.data.clientId,
                sessionId: ws.data.sessionId,
                msgs: msg.msgs,
              })
              return
            }
          }
        }

        default: {
          transport.wire.publish({
            t: "got-bad-msgs",
            reason: "codebase-version-id-mismatch",
            clientId: ws.data.clientId,
            sessionId: ws.data.sessionId,
            msgs: msg.msgs,
          })
          return
        }
      }
    },
  }

  server.registerFetchHandler(onRequest)
  server.setWebSocketHandler(websocket)

  transport.wire.publish({ t: "server-started", port: NaN })

  //
  //
  //
  // Hook up topics
  //
  //
  //

  transport.topicPublish.subscribe((msg) => {
    for (const topic of msg.topics) {
      server.publish(topic, JSON.stringify(msg.msg))
    }
  })

  transport.topicSubscribe.subscribe((msg) => {
    const client = clients.get(msg.clientId)
    if (!client) {
      return
    }
    for (const topic of msg.topics) {
      client.subscribe(topic)
    }
  })

  //
  //
  //
  // Hook up toClient
  //
  //
  //

  const send = (
    ws: ServerWebSocket<ServerWebSocketData>,
    msg: MsgServerToMsgClient<MsgToClient>,
  ) => {
    switch (ws.readyState) {
      case 1: {
        ws.send(JSON.stringify(msg))
        return
      }
      default: {
        return
      }
    }
  }

  transport.toClientBroadcast.subscribe((msgs) => {
    for (const client of clients.values()) {
      send(client, { t: "to-client", msgs, codebaseVersionId })
    }
  })

  transport.toClient.subscribe((toClient) => {
    for (const clientId in toClient) {
      const toClientSingle = toClient[clientId as ClientId]!
      const client = clients.get(clientId as ClientId)

      if (!client) {
        continue
      }

      send(client, {
        t: "to-client",
        msgs: toClientSingle.msgs,
        codebaseVersionId,
      })
    }
  })

  //
  //
  //
  //
  //
  //

  return transport
}
