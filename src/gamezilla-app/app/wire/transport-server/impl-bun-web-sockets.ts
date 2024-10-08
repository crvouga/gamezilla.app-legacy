import type { Server, ServerWebSocket, WebSocketHandler } from 'bun'
import { LRUCache } from 'gamezilla-app/@/least-recently-used-cache'
import type { ServerBun } from 'gamezilla-app/@/server/server-impl-bun/server-impl-bun'
import { ClientId, SessionId } from 'gamezilla-app/app/@/data'
import { IDbConnSql } from 'gamezilla-app/app/@/server/db-conn-sql'
import { ILogger } from 'gamezilla-app/app/@/server/logger'
import {
  SESSION_ID_COOKIE_NAME,
  toSetSessionCookie,
  type MsgClientToMsgServer,
  type MsgServerToMsgClient
} from '../transport.core'
import { initServerTransport, type IServerTransport } from './interface'

type ServerWebSocketData = {
  clientId: ClientId
  sessionId: SessionId
}

export type Config = {
  t: 'bun-server-web-sockets'
  codebaseVersionId: string
  server: ServerBun
  dbConnSql: IDbConnSql
  logger: ILogger
}

export const ServerTransport = <MsgToServer, MsgToClient>(
  config: Config
): IServerTransport<{
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

  const clients = LRUCache<ClientId, ServerWebSocket<ServerWebSocketData>>({ maxCapacity: 10_000 })

  const clientsBySessionId = LRUCache<SessionId, Set<ClientId>>({ maxCapacity: 10_000 })

  const addClient = async (ws: ServerWebSocket<ServerWebSocketData>) => {
    const clientId = ws.data.clientId
    const sessionId = ws.data.sessionId
    clients.set(clientId, ws)

    const clientIds = clientsBySessionId.get(sessionId) ?? new Set<ClientId>()
    clientIds.add(clientId)
    clientsBySessionId.set(sessionId, clientIds)
  }

  const removeClient = async (ws: ServerWebSocket<ServerWebSocketData>) => {
    const clientId = ws.data.clientId
    const sessionId = ws.data.sessionId
    clients.delete(clientId)

    clientsBySessionId.get(sessionId)?.delete(clientId)
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
      case '/ws': {
        const maybeSessionIdCookie = req.headers
          ?.get('cookie')
          ?.split(';')
          ?.map((cookie) => cookie.trim())
          ?.find((cookie) => cookie.startsWith(`${SESSION_ID_COOKIE_NAME}=`))
          ?.split('=')

        const maybeSessionId = maybeSessionIdCookie ? maybeSessionIdCookie[1] : null

        const sessionId = SessionId.is(maybeSessionId) ? maybeSessionId : SessionId.generate()

        const clientId = ClientId.generate()

        const data: ServerWebSocketData = {
          clientId,
          sessionId
        }

        const headers: Record<string, string> = maybeSessionId
          ? {}
          : {
              'Set-Cookie': toSetSessionCookie(sessionId)
            }

        server.upgrade(req, {
          headers,
          data
        })
        return
      }

      default: {
        return null
      }
    }
  }

  const websocket: WebSocketHandler<ServerWebSocketData> = {
    async open(ws: ServerWebSocket<ServerWebSocketData>) {
      await addClient(ws)
      transport.wire.pub({
        t: 'client-connected',
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId
      })
    },
    async close(ws: ServerWebSocket<ServerWebSocketData>, _code, _message) {
      await removeClient(ws)
      transport.wire.pub({
        t: 'client-disconnected',
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId
      })
    },
    message(ws: ServerWebSocket<ServerWebSocketData>, message) {
      const msg = JSON.parse(message.toString()) as MsgClientToMsgServer<MsgToServer> // leap of faith

      if (msg.v !== config.codebaseVersionId) {
        transport.wire.pub({
          t: 'got-bad-msgs',
          reason: 'codebase-version-id-mismatch',
          clientId: ws.data.clientId,
          sessionId: ws.data.sessionId,
          msgs: msg.m
        })
      }

      transport.toServer.pub({
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId,
        msgs: msg.m
      })
    }
  }

  config.server._registerFetchHandler(onRequest)
  config.server._setWebSocketHandler(websocket)

  transport.wire.pub({
    t: 'server-started',
    port: Number.NaN
  })

  //
  //
  //
  // Hook up toClient
  //
  //
  //

  const send = async (ws: ServerWebSocket<ServerWebSocketData>, msg: MsgServerToMsgClient<MsgToClient>) => {
    await new Promise((resolve) => resolve(null))
    config.logger.debug(`sending to client ${ws.data.clientId}`)

    switch (ws.readyState) {
      case 1: {
        const encoded = JSON.stringify(msg)
        ws.send(encoded)
        return
      }
      default: {
        return
      }
    }
  }

  transport.toClientBroadcast.sub((msgs) => {
    for (const client of clients.values()) {
      send(client, {
        m: msgs,
        v: config.codebaseVersionId
      })
    }
  })

  transport.toClient.sub((toClient) => {
    for (const clientId in toClient) {
      const toClientSingle = toClient[clientId as ClientId]!
      const client = clients.get(clientId as ClientId)

      if (!client) {
        continue
      }

      send(client, {
        m: toClientSingle.msgs,
        v: config.codebaseVersionId
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
