import { Server, ServerWebSocket } from 'bun'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import { ILogger, Logger } from '~/@/logger'
import { isErr } from '~/@/result'
import { PubSub, Sub } from '~/@/sub'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionId } from '~/@/wire/session-id'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { Client, Contract } from '../types'
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

  const subByTopic = new Map<string, PubSub<unknown>>()
  const subscribersByTopic = new Map<string, Set<ClientId>>()
  const clients = new Map<ClientId, ServerWebSocket<BackendWebSocketData>>()

  const publish = (topicString: string, msg: ToClientMsg) => {
    const encoded = JSON.stringify(msg)
    logger.debug(`websocket message published topic=${topicString}`)
    const subscribers = subscribersByTopic.get(topicString)
    for (const clientId of subscribers ?? []) {
      const client = clients.get(clientId)
      if (client) {
        client.send(encoded)
      }
    }
    switch (msg.t) {
      case 'published': {
        const existingSub = subByTopic.get(topicString)
        if (existingSub) {
          const json = JSON.parse(msg.msg)
          existingSub.pub(json)
        }
        break
      }
    }
  }

  config.httpServer._setWebSocketHandler({
    async open(ws: ServerWebSocket<BackendWebSocketData>) {
      logger.debug(`websocket connection opened clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
      clients.set(ws.data.clientId, ws)
    },
    async close(ws: ServerWebSocket<BackendWebSocketData>, _code, _message) {
      logger.debug(`websocket connection closed clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
      clients.delete(ws.data.clientId)
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
          subscribersByTopic.set(
            topicString,
            new Set([...(subscribersByTopic.get(topicString) ?? []), ws.data.clientId]),
          )
          publish(topicString, {
            t: 'subscribed',
            topicName: toServerMsg.value.topicName,
            topicParams: toServerMsg.value.topicParams,
          })
          logger.debug(
            `websocket message subscribed ${topicString} clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`,
          )
          return
        }
        case 'publish': {
          const topicString = toTopicString({
            topicName: toServerMsg.value.topicName,
            topicParams: toServerMsg.value.topicParams,
          })
          publish(topicString, {
            t: 'published',
            topicName: toServerMsg.value.topicName,
            topicParams: toServerMsg.value.topicParams,
            msg: toServerMsg.value.msg,
          })
          logger.debug(`websocket message published topic=${topicString}`)
          return
        }
        case 'unsubscribe': {
          const topicString = toTopicString({
            topicName: toServerMsg.value.topicName,
            topicParams: toServerMsg.value.topicParams,
          })
          publish(topicString, {
            t: 'unsubscribed',
            topicName: toServerMsg.value.topicName,
            topicParams: toServerMsg.value.topicParams,
          })
          const existingSubscribers = subscribersByTopic.get(topicString)
          if (existingSubscribers) {
            existingSubscribers.delete(ws.data.clientId)
          }
          logger.debug(
            `websocket message unsubscribed ${topicString} clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`,
          )

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

      return
    }

    return null
  })

  const createClientRecursive = (currentContract: Contract<any>, runningTopicName: string[] = []): any => {
    const clientProxy: any = {}

    for (const topicNamePart in currentContract) {
      const topicConfig = currentContract[topicNamePart]

      if (!topicConfig) continue

      const topicName: string[] = [...runningTopicName, topicNamePart]

      if ('params' in topicConfig && 'msg' in topicConfig) {
        clientProxy[topicNamePart] = {
          publish: (topicParams: unknown, msg: unknown) => {
            const topicString = toTopicString({
              topicName,
              topicParams,
            })
            publish(topicString, {
              t: 'published',
              topicName,
              topicParams,
              msg: JSON.stringify(msg),
            })
            const existingSub = subByTopic.get(topicString)
            if (!existingSub) {
              logger.debug(`no subscribers for topic=${topicString}`)
              return
            }
            logger.debug(`publishing message to topic=${topicString}`)
            existingSub.pub(msg)
          },
          subscribe: (topicParams: unknown): Sub<any> => {
            const topicString = toTopicString({
              topicName,
              topicParams,
            })

            const existingSub = subByTopic.get(topicString)

            if (existingSub) {
              logger.debug(`reusing existing subscription for topic=${topicString}`)
              return existingSub
            }

            logger.debug(`subscribing to topic=${topicString}`)
            const pubSub = PubSub.create()
            subByTopic.set(topicString, pubSub)

            return {
              ...pubSub,
              sub(subscriber) {
                const unsub = pubSub.sub(subscriber)
                return () => {
                  unsub()
                  logger.debug(`unsubscribing from topic=${topicString}`)
                }
              },
            }
          },
        }
      } else {
        clientProxy[topicNamePart] = createClientRecursive(topicConfig as Contract<any>, [
          ...runningTopicName,
          topicNamePart,
        ])
      }
    }
    return clientProxy
  }

  return createClientRecursive(config.contract) as Client<T>
}
