import { Server, ServerWebSocket } from 'bun'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import { ILogger, Logger } from '~/@/logger'
import { isErr } from '~/@/result'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionId } from '~/@/wire/session-id'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { Client, Contract } from '../types'
import { initClient } from './client'
import { ToClientMsg, ToServerMsg, toTopicString } from './shared'

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
}): Client<T> => {
  const logger = Logger.prefix('server', config.logger)

  let bunServer: Server

  let client: Client<T> | null = null

  config.httpServer._setWebSocketHandler({
    async open(ws: ServerWebSocket<BackendWebSocketData>) {
      logger.debug(`websocket connection opened clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
    },
    async close(ws: ServerWebSocket<BackendWebSocketData>, _code, _message) {
      logger.debug(`websocket connection closed clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
    },
    async message(ws: ServerWebSocket<BackendWebSocketData>, message: string) {
      logger.debug(`websocket message received clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)

      const toServerMsg = ToServerMsg.parse(JSON.parse(message))

      if (isErr(toServerMsg)) {
        logger.error(`websocket message received clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
        return
      }

      switch (toServerMsg.value.t) {
        case 'subscribe': {
          const topicString = toTopicString({
            topicName: toServerMsg.value.topicName,
            topicParams: toServerMsg.value.topicParams,
          })
          ws.subscribe(topicString)
          const toClientMsg: ToClientMsg = {
            t: 'subscribed',
            topicName: toServerMsg.value.topicName,
            topicParams: toServerMsg.value.topicParams,
          }
          ws.send(JSON.stringify(toClientMsg))
          logger.debug(`websocket message subscribed clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
          return
        }
        case 'publish': {
          const topicString = toTopicString({
            topicName: toServerMsg.value.topicName,
            topicParams: toServerMsg.value.topicParams,
          })
          const toClientMsg: ToClientMsg = {
            t: 'published',
            topicName: toServerMsg.value.topicName,
            topicParams: toServerMsg.value.topicParams,
            msg: toServerMsg.value.msg,
          }
          bunServer.publish(topicString, JSON.stringify(toClientMsg))
          logger.debug(`websocket message published clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
          return
        }
        case 'unsubscribe': {
          const topicString = toTopicString({
            topicName: toServerMsg.value.topicName,
            topicParams: toServerMsg.value.topicParams,
          })
          ws.unsubscribe(topicString)
          const toClient: ToClientMsg = {
            t: 'unsubscribed',
            topicName: toServerMsg.value.topicName,
            topicParams: toServerMsg.value.topicParams,
          }
          ws.send(JSON.stringify(toClient))
          logger.debug(`websocket message unpublished clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)

          return
        }
        default: {
          return
        }
      }
    },
  })

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

      client ??= initClient({
        t: 'web-sockets',
        clientSessionId: ClientSessionId.generate(),
        contract: config.contract,
        serverUrl: request.url,
        endpoint: config.endpoint,
        logger,
      })

      return
    }

    return null
  })

  return client ?? initClient({ t: 'local', contract: config.contract, logger })
}
