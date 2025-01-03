import type { Server, ServerWebSocket } from 'bun'
import { IDbConnSql } from '~/@/db-conn-sql'
import { ILogger, Logger } from '~/@/logger'
import { IPubSubTopicBased } from '~/@/pub-sub-topic-based'
import type { WebServerBun } from '~/@/web-server/impl-bun'
import { ClientId } from '~/app/@/data/client-id'
import { SessionId } from '~/app/@/data/session-id'
import { SessionIdCookie } from '../session-id-cookie'
import { WEB_SOCKET_ENDPOINT } from '../shared'
import { type MsgClientToMsgServer, type MsgServerToMsgClient } from '../types'
import { initServerTransport, type IServerTransport } from './interface'

type ServerWebSocketData = {
  clientId: ClientId
  sessionId: SessionId
}

export type Config = {
  t: 'bun-web-sockets'
  webServer: WebServerBun
  dbConnSql: IDbConnSql
  logger: ILogger
  pubSubTopicBased: IPubSubTopicBased
  isProd: boolean
}

export const ServerTransport = async <MsgToServer, MsgToClient>(
  config: Config
): Promise<
  IServerTransport<{
    MsgToClient: MsgToClient
    MsgToServer: MsgToServer
  }>
> => {
  const logger = Logger.prefix('bun-web-sockets', config.logger)
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
  const unlistens = new Map<ClientId, () => void>()
  const clientsBySessionId = new Map<SessionId, Set<ClientId>>()

  const addClient = async (ws: ServerWebSocket<ServerWebSocketData>) => {
    clients.set(ws.data.clientId, ws)
    const clientIds = clientsBySessionId.get(ws.data.sessionId) ?? new Set<ClientId>()
    clientIds.add(ws.data.clientId)
    clientsBySessionId.set(ws.data.sessionId, clientIds)
    unlistens.set(
      ws.data.clientId,
      await config.pubSubTopicBased.sub(ws.data.clientId, (msg) => {
        logger.debug(`received msg for clientId=${ws.data.clientId} from other server instance`)
        send(ws, JSON.parse(msg))
      })
    )
  }

  const removeClient = async (ws: ServerWebSocket<ServerWebSocketData>) => {
    clients.delete(ws.data.clientId)
    clientsBySessionId.get(ws.data.sessionId)?.delete(ws.data.clientId)
    unlistens.get(ws.data.clientId)?.()
  }

  //
  //
  //
  // Web Server
  //
  //
  //

  config.webServer._setWebSocketHandler({
    async open(ws: ServerWebSocket<ServerWebSocketData>) {
      logger.debug(`websocket connection opened clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
      await addClient(ws)
      transport.wire.pub({
        t: 'client-connected',
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId
      })
    },
    async close(ws: ServerWebSocket<ServerWebSocketData>, _code, _message) {
      logger.debug(`websocket connection closed clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
      await removeClient(ws)
      transport.wire.pub({
        t: 'client-disconnected',
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId
      })
    },
    message(ws: ServerWebSocket<ServerWebSocketData>, message) {
      logger.debug(`websocket message received clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)

      const msg = JSON.parse(message.toString()) as MsgClientToMsgServer<MsgToServer> // leap of faith

      transport.fromClient.pub({
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId,
        msgs: msg
      })
    }
  })

  config.webServer.registerHandler((request, maybeServer) => {
    const server = maybeServer as Server
    const url = new URL(request.url)

    switch (url.pathname) {
      case WEB_SOCKET_ENDPOINT: {
        const cookies = request.headers?.get('cookie')?.split(';')

        const maybeSessionId = SessionIdCookie.fromCookies({
          cookies: cookies?.join(';') ?? ''
        })

        const sessionId = maybeSessionId ? maybeSessionId : SessionId.generate()

        const clientId = ClientId.generate()

        const data: ServerWebSocketData = {
          clientId,
          sessionId
        }

        const headers = new Headers()

        if (!maybeSessionId) {
          headers.append(
            'Set-Cookie',
            SessionIdCookie.toSetCookieHeaderValue({
              sessionId,
              isProd: config.isProd
            })
          )
        }

        logger.debug(
          `${WEB_SOCKET_ENDPOINT} request received clientId=${clientId} sessionId=${sessionId} headers=${headers.toJSON()}`
        )
        server.upgrade(request, { headers, data })
        return
      }

      default: {
        return null
      }
    }
  })

  //
  //
  //
  // Hook up toClient
  //
  //
  //

  const send = async (ws: ServerWebSocket<ServerWebSocketData>, msg: MsgServerToMsgClient<MsgToClient>) => {
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

  const sendWithPub = async (ws: ServerWebSocket<ServerWebSocketData>, msg: MsgServerToMsgClient<MsgToClient>) => {
    send(ws, msg)
    config.pubSubTopicBased.pub(ws.data.clientId, JSON.stringify(msg))
    logger.debug(`sent msg for clientId=${ws.data.clientId} to other server instances`)
  }

  transport.toClientBroadcast.sub((msgs) => {
    for (const client of clients.values()) {
      sendWithPub(client, msgs)
    }
  })

  transport.toClient.sub((toClient) => {
    for (const clientId in toClient) {
      const toClientSingle = toClient[clientId as ClientId]!
      const client = clients.get(clientId as ClientId)

      if (!client) {
        continue
      }

      sendWithPub(client, toClientSingle.msgs)
    }
  })

  //
  //
  //
  //
  //
  //

  transport.wire.pub({
    t: 'server-started',
    port: Number.NaN
  })

  return transport
}
