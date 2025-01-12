import type { Server, ServerWebSocket } from 'bun'
import { IDbConnSql } from '~/@/db-conn-sql'
import { ILogger, Logger } from '~/@/logger'
import { IPubSubTopicBased } from '~/@/pub-sub-topic-based'
import type { HttpServerBun } from '~/@/http-server/impl-bun'
import { FrontendId } from '~/app/@/data/frontend-id'
import { SessionId } from '~/app/@/data/session-id'
import { SessionIdCookie } from '../session-id-cookie'
import { WEB_SOCKET_ENDPOINT } from '../shared'
import { type MsgFrontendToMsgBackend, type MsgBackendToMsgFrontend } from '../types'
import { initBackendTransport, type IBackendTransport } from './interface'

type BackendWebSocketData = {
  frontendId: FrontendId
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

  const frontends = new Map<FrontendId, ServerWebSocket<BackendWebSocketData>>()
  const unlistens = new Map<FrontendId, () => void>()
  const frontendsBySessionId = new Map<SessionId, Set<FrontendId>>()

  const addFrontend = async (ws: ServerWebSocket<BackendWebSocketData>) => {
    frontends.set(ws.data.frontendId, ws)
    const frontendIds = frontendsBySessionId.get(ws.data.sessionId) ?? new Set<FrontendId>()
    frontendIds.add(ws.data.frontendId)
    frontendsBySessionId.set(ws.data.sessionId, frontendIds)
    unlistens.set(
      ws.data.frontendId,
      await config.pubSubTopicBased.sub(ws.data.frontendId, (msg) => {
        logger.debug(`received msg for frontendId=${ws.data.frontendId} from other backend instance`)
        send(ws, JSON.parse(msg))
      }),
    )
  }

  const removeFrontend = async (ws: ServerWebSocket<BackendWebSocketData>) => {
    frontends.delete(ws.data.frontendId)
    frontendsBySessionId.get(ws.data.sessionId)?.delete(ws.data.frontendId)
    unlistens.get(ws.data.frontendId)?.()
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
      logger.debug(`websocket connection opened frontendId=${ws.data.frontendId} sessionId=${ws.data.sessionId}`)
      await addFrontend(ws)
      transport.wire.pub({
        t: 'frontend-connected',
        frontendId: ws.data.frontendId,
        sessionId: ws.data.sessionId,
      })
    },
    async close(ws: ServerWebSocket<BackendWebSocketData>, _code, _message) {
      logger.debug(`websocket connection closed frontendId=${ws.data.frontendId} sessionId=${ws.data.sessionId}`)
      await removeFrontend(ws)
      transport.wire.pub({
        t: 'frontend-disconnected',
        frontendId: ws.data.frontendId,
        sessionId: ws.data.sessionId,
      })
    },
    message(ws: ServerWebSocket<BackendWebSocketData>, message) {
      logger.debug(`websocket message received frontendId=${ws.data.frontendId} sessionId=${ws.data.sessionId}`)

      const msg = JSON.parse(message.toString()) as MsgFrontendToMsgBackend<MsgToBackend> // leap of faith

      transport.fromFrontend.pub({
        frontendId: ws.data.frontendId,
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

        const frontendId = FrontendId.generate()

        const data: BackendWebSocketData = {
          frontendId,
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
          `${WEB_SOCKET_ENDPOINT} request received frontendId=${frontendId} sessionId=${sessionId} headers=${headers.toJSON()}`,
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
    config.pubSubTopicBased.pub(ws.data.frontendId, JSON.stringify(msg))
    logger.debug(`sent msg for frontendId=${ws.data.frontendId} to other backend instances`)
  }

  transport.toFrontendBroadcast.sub((msgs) => {
    for (const frontend of frontends.values()) {
      sendWithPub(frontend, msgs)
    }
  })

  transport.toFrontend.sub((toFrontend) => {
    for (const frontendId in toFrontend) {
      const toFrontendSingle = toFrontend[frontendId as FrontendId]!
      const frontend = frontends.get(frontendId as FrontendId)

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
