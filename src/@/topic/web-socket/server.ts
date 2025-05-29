import { Server, ServerWebSocket } from 'bun'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import { ILogger, Logger } from '~/@/logger'
import { isErr } from '~/@/result'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionId } from '~/@/wire/session-id'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { Contract } from '../types'
import { ToClientMsg, ToServer, toTopicString } from './shared'

export type BackendWebSocketData = {
  clientId: ClientId
  sessionId: SessionId
  clientSessionId: ClientSessionId
}

export const initServer = <T extends Contract<any>>(config: {
  t: 'web-sockets'
  contract: T
  httpServer: HttpServerBun
  logger: ILogger
  isProd: boolean
  endpoint: string
}) => {
  const logger = Logger.prefix('server', config.logger)
  let bunServer: Server
  config.httpServer.registerRespond((request, server) => {
    bunServer = server as Server
    const url = new URL(request.url)

    if (url.pathname === config.endpoint) {
      const maybeSessionId = SessionIdHttp.fromRequest(request)
      const sessionId = maybeSessionId ? maybeSessionId : SessionId.generate()

      const maybeClientSessionId = ClientSessionIdHttp.fromRequest(request)
      const clientSessionId = maybeClientSessionId ?? ClientSessionId.generate()

      const clientId = ClientId.generate()

      const data: BackendWebSocketData = {
        clientId,
        sessionId,
        clientSessionId,
      }

      const headers = new Headers()

      if (!maybeSessionId) {
        headers.append('Set-Cookie', SessionIdHttp.toSetCookieHeaderValue({ sessionId, isProd: config.isProd }))
      }

      logger.debug(
        `${config.endpoint} request received clientId=${clientId} sessionId=${sessionId} headers=${headers.toJSON()}`,
      )
      bunServer.upgrade(request, { headers, data })
      return
    }

    return null
  })

  config.httpServer._setWebSocketHandler({
    async open(ws: ServerWebSocket<BackendWebSocketData>) {
      logger.debug(`websocket connection opened clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
    },
    async close(ws: ServerWebSocket<BackendWebSocketData>, _code, _message) {
      logger.debug(`websocket connection closed clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
    },
    async message(ws: ServerWebSocket<BackendWebSocketData>, message: unknown) {
      logger.debug(`websocket message received clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)

      const parsed = ToServer.parse(message)

      if (isErr(parsed)) {
        logger.error(`websocket message received clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
        return
      }

      switch (parsed.value.t) {
        case 'subscribe': {
          const topicString = toTopicString({
            topicName: parsed.value.topicName,
            topicParams: parsed.value.topicParams,
          })
          ws.subscribe(topicString)
          const toClient: ToClientMsg = {
            t: 'subscribed',
            topicName: parsed.value.topicName,
            topicParams: parsed.value.topicParams,
          }
          ws.send(JSON.stringify(toClient))
          return
        }
        case 'publish': {
          const topicString = toTopicString({
            topicName: parsed.value.topicName,
            topicParams: parsed.value.topicParams,
          })
          bunServer.publish(topicString, parsed.value.msg)
          const toClient: ToClientMsg = {
            t: 'published',
            topicName: parsed.value.topicName,
            topicParams: parsed.value.topicParams,
            msg: parsed.value.msg,
          }
          ws.send(JSON.stringify(toClient))
          return
        }
        case 'unsubscribe': {
          const topicString = toTopicString({
            topicName: parsed.value.topicName,
            topicParams: parsed.value.topicParams,
          })
          ws.unsubscribe(topicString)
          const toClient: ToClientMsg = {
            t: 'unsubscribed',
            topicName: parsed.value.topicName,
            topicParams: parsed.value.topicParams,
          }
          ws.send(JSON.stringify(toClient))
          return
        }
        default: {
          return
        }
      }
    },
  })
}
