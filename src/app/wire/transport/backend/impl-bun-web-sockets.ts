import type { Server, ServerWebSocket } from 'bun'
import { IDbConnSql } from '~/@/db-conn-sql'
import { ILogger, Logger } from '~/@/logger'
import { IPubSubTopicBased } from '~/@/pub-sub-topic-based'
import type { HttpServerBun } from '~/@/http-server/impl-bun'
import { ClientId } from '~/app/@/data/client-id'
import { SessionId } from '~/app/@/data/session-id'
import { SessionIdCookie } from '../session-id-cookie'
import { WEB_SOCKET_ENDPOINT } from '../shared'
import { type MsgFrontendToMsgBackend, type MsgBackendToMsgFrontend } from '../types'
import { initBackendTransport, type IBackendTransport } from './interface'

type BackendWebSocketData = {
  clientId: ClientId
  sessionId: SessionId
}

export type Config = {
  t: 'bun-web-sockets'
  httpServer: HttpServerBun
  dbConnSql: IDbConnSql
  logger: ILogger
  pubSubTopicBased: IPubSubTopicBased
  isProd: boolean
}

export const BackendTransport = async <MsgToBackend, MsgToFrontend>(
  config: Config,
): Promise<IBackendTransport<{ MsgToFrontend: MsgToFrontend; MsgToBackend: MsgToBackend }>> => {
  const logger = Logger.prefix('bun-web-sockets', config.logger)
  //
  //
  //
  // Output
  //
  //
  //

  const transport = initBackendTransport<MsgToBackend, MsgToFrontend>()

  //
  //
  //
  // State
  //
  //
  //

  const frontends = new Map<ClientId, ServerWebSocket<BackendWebSocketData>>()
  const unlistens = new Map<ClientId, () => void>()
  const frontendsBySessionId = new Map<SessionId, Set<ClientId>>()

  const addFrontend = async (ws: ServerWebSocket<BackendWebSocketData>) => {
    frontends.set(ws.data.clientId, ws)
    const clientIds = frontendsBySessionId.get(ws.data.sessionId) ?? new Set<ClientId>()
    clientIds.add(ws.data.clientId)
    frontendsBySessionId.set(ws.data.sessionId, clientIds)
    unlistens.set(
      ws.data.clientId,
      await config.pubSubTopicBased.sub(ws.data.clientId, (msg) => {
        logger.debug(`received msg for clientId=${ws.data.clientId} from other backend instance`)
        send(ws, JSON.parse(msg))
      }),
    )
  }

  const removeFrontend = async (ws: ServerWebSocket<BackendWebSocketData>) => {
    frontends.delete(ws.data.clientId)
    frontendsBySessionId.get(ws.data.sessionId)?.delete(ws.data.clientId)
    unlistens.get(ws.data.clientId)?.()
  }

  //
  //
  //
  // Web Backend
  //
  //
  //

  config.httpServer._setWebSocketHandler({
    async open(ws: ServerWebSocket<BackendWebSocketData>) {
      logger.debug(`websocket connection opened clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
      await addFrontend(ws)
      transport.wire.pub({
        t: 'frontend-connected',
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId,
      })
    },
    async close(ws: ServerWebSocket<BackendWebSocketData>, _code, _message) {
      logger.debug(`websocket connection closed clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
      await removeFrontend(ws)
      transport.wire.pub({
        t: 'frontend-disconnected',
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId,
      })
    },
    message(ws: ServerWebSocket<BackendWebSocketData>, message) {
      logger.debug(`websocket message received clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)

      const msg = JSON.parse(message.toString()) as MsgFrontendToMsgBackend<MsgToBackend> // leap of faith

      transport.fromFrontend.pub({
        clientId: ws.data.clientId,
        sessionId: ws.data.sessionId,
        msgs: msg,
      })
    },
  })

  config.httpServer.registerHandler((request, maybeBackend) => {
    const backend = maybeBackend as Server
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
        backend.upgrade(request, { headers, data })
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
  // Hook up toFrontend
  //
  //
  //

  const send = async (ws: ServerWebSocket<BackendWebSocketData>, msg: MsgBackendToMsgFrontend<MsgToFrontend>) => {
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

  const sendWithPub = async (
    ws: ServerWebSocket<BackendWebSocketData>,
    msg: MsgBackendToMsgFrontend<MsgToFrontend>,
  ) => {
    send(ws, msg)
    config.pubSubTopicBased.pub(ws.data.clientId, JSON.stringify(msg))
    logger.debug(`sent msg for clientId=${ws.data.clientId} to other backend instances`)
  }

  transport.toFrontendBroadcast.sub((msgs) => {
    for (const frontend of frontends.values()) {
      sendWithPub(frontend, msgs)
    }
  })

  transport.toFrontend.sub((toFrontend) => {
    for (const clientId in toFrontend) {
      const toFrontendSingle = toFrontend[clientId as ClientId]!
      const frontend = frontends.get(clientId as ClientId)

      if (!frontend) {
        continue
      }

      sendWithPub(frontend, toFrontendSingle.msgs)
    }
  })

  //
  //
  //
  //
  //
  //

  transport.wire.pub({
    t: 'backend-started',
    port: Number.NaN,
  })

  return transport
}
