import type { Server, ServerWebSocket } from 'bun'
import { IDbConnSql } from '~/@/db-conn-sql'
import { ILogger, Logger } from '~/@/logger'
import { IPubSubTopicBased } from '~/@/pub-sub-topic-based'
import type { WebBackendBun } from '~/@/web-server/impl-bun'
import { ClientId } from '~/app/@/data/client-id'
import { SessionId } from '~/app/@/data/session-id'
import { SessionIdCookie } from '../session-id-cookie'
import { WEB_SOCKET_ENDPOINT } from '../shared'
import { type MsgClientToMsgBackend, type MsgBackendToMsgClient } from '../types'
import { initBackendTransport, type IBackendTransport } from './interface'

type BackendWebSocketData = {
  clientId: ClientId
  sessionId: SessionId
}

export type Config = {
  t: 'bun-web-sockets'
  webBackend: WebBackendBun
  dbConnSql: IDbConnSql
  logger: ILogger
  pubSubTopicBased: IPubSubTopicBased
  isProd: boolean
}

export const BackendTransport = async <MsgToBackend, MsgToClient>(
  config: Config,
): Promise<IBackendTransport<{ MsgToClient: MsgToClient; MsgToBackend: MsgToBackend }>> => {
  const logger = Logger.prefix('bun-web-sockets', config.logger)
  //
  //
  //
  // Output
  //
  //
  //

  const transport = initBackendTransport<MsgToBackend, MsgToClient>()

  //
  //
  //
  // State
  //
  //
  //

  const clients = new Map<ClientId, ServerWebSocket<BackendWebSocketData>>()
  const unlistens = new Map<ClientId, () => void>()
  const clientsBySessionId = new Map<SessionId, Set<ClientId>>()

  const addClient = async (ws: ServerWebSocket<BackendWebSocketData>) => {
    clients.set(ws.data.clientId, ws)
    const clientIds = clientsBySessionId.get(ws.data.sessionId) ?? new Set<ClientId>()
    clientIds.add(ws.data.clientId)
    clientsBySessionId.set(ws.data.sessionId, clientIds)
    unlistens.set(
      ws.data.clientId,
      await config.pubSubTopicBased.sub(ws.data.clientId, (msg) => {
        logger.debug(`received msg for clientId=${ws.data.clientId} from other server instance`)
        send(ws, JSON.parse(msg))
      }),
    )
  }

  const removeClient = async (ws: ServerWebSocket<BackendWebSocketData>) => {
    clients.delete(ws.data.clientId)
    clientsBySessionId.get(ws.data.sessionId)?.delete(ws.data.clientId)
    unlistens.get(ws.data.clientId)?.()
  }

  //
  //
  //
  // Web Backend
  //
  //
  //

  config.webBackend._setWebSocketHandler({
    async open(ws: ServerWebSocket<BackendWebSocketData>) {
      logger.debug(`websocket connection opened clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
      await addClient(ws)
      transport.wire.pub({
        t: 'client-connected',
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId,
      })
    },
    async close(ws: ServerWebSocket<BackendWebSocketData>, _code, _message) {
      logger.debug(`websocket connection closed clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
      await removeClient(ws)
      transport.wire.pub({
        t: 'client-disconnected',
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId,
      })
    },
    message(ws: ServerWebSocket<BackendWebSocketData>, message) {
      logger.debug(`websocket message received clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)

      const msg = JSON.parse(message.toString()) as MsgClientToMsgBackend<MsgToBackend> // leap of faith

      transport.fromClient.pub({
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId,
        msgs: msg,
      })
    },
  })

  config.webBackend.registerHandler((request, maybeBackend) => {
    const server = maybeBackend as Server
    const url = new URL(request.url)

    switch (url.pathname) {
      case WEB_SOCKET_ENDPOINT: {
        const cookies = request.headers?.get('cookie')?.split(';')

        const maybeSessionId = SessionIdCookie.fromCookies({
          cookies: cookies?.join(';') ?? '',
        })

        const sessionId = maybeSessionId ? maybeSessionId : SessionId.generate()

        const clientId = ClientId.generate()

        const data: BackendWebSocketData = {
          clientId,
          sessionId,
        }

        const headers = new Headers()

        if (!maybeSessionId) {
          headers.append(
            'Set-Cookie',
            SessionIdCookie.toSetCookieHeaderValue({
              sessionId,
              isProd: config.isProd,
            }),
          )
        }

        logger.debug(
          `${WEB_SOCKET_ENDPOINT} request received clientId=${clientId} sessionId=${sessionId} headers=${headers.toJSON()}`,
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

  const send = async (ws: ServerWebSocket<BackendWebSocketData>, msg: MsgBackendToMsgClient<MsgToClient>) => {
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

  const sendWithPub = async (ws: ServerWebSocket<BackendWebSocketData>, msg: MsgBackendToMsgClient<MsgToClient>) => {
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
    port: Number.NaN,
  })

  return transport
}
