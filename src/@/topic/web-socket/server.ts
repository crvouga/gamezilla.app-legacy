import { ServerWebSocket } from 'bun'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import { ILogger, Logger } from '~/@/logger'
import { s } from '~/@/schema'
import { PubSub, Sub } from '~/@/sub'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionId } from '~/@/wire/session-id'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { Client, Contract, MsgMeta } from '../types'
import { ToClientMsgMany, ToServerMsg, toTopicString } from './shared'

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

  let bunServer: Bun.Server

  const subByTopic = new Map<string, PubSub<unknown>>()

  const publish = (topicString: string, msg: ToClientMsgMany, ws: ServerWebSocket<BackendWebSocketData> | null) => {
    const encoded = JSON.stringify(msg)
    logger.debug(`websocket message published topic=${topicString}`)
    bunServer.publish(topicString, encoded)
    const existingSub = subByTopic.get(topicString)
    if (existingSub) {
      let json = JSON.parse(msg.msg)
      if (ws) {
        json = {
          ...json,
          clientId: ws.data.clientId,
          sessionId: ws.data.sessionId,
          clientSessionId: ws.data.clientSessionId,
        }
      }
      existingSub.pub(json)
    }
  }

  config.httpServer._setWebSocketHandler({
    async open(ws: ServerWebSocket<BackendWebSocketData>) {
      logger.debug(`websocket connection opened clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
    },
    async close(ws: ServerWebSocket<BackendWebSocketData>, _code, _message) {
      logger.debug(`websocket connection closed clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
    },
    async message(ws: ServerWebSocket<BackendWebSocketData>, message: string) {
      logger.debug(`websocket message received clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)

      const toServerMsg: ToServerMsg = JSON.parse(message) as ToServerMsg

      switch (toServerMsg.t) {
        case 'subscribe': {
          const topicString = toTopicString(toServerMsg.topicName, toServerMsg.topicParams)
          ws.subscribe(topicString)
          ws.send(
            JSON.stringify({
              t: 'subscribed',
              topicName: toServerMsg.topicName,
              topicParams: toServerMsg.topicParams,
            }),
          )
          logger.debug(
            `websocket message subscribed ${topicString} subscriberCount=${bunServer.subscriberCount(topicString)} clientId=${ws.data.clientId} sessionId=${ws.data.sessionId} `,
          )
          return
        }
        case 'publish': {
          const topicString = toTopicString(toServerMsg.topicName, toServerMsg.topicParams)
          publish(
            topicString,
            {
              t: 'published',
              topicName: toServerMsg.topicName,
              topicParams: toServerMsg.topicParams,
              msg: toServerMsg.msg,
            },
            ws,
          )
          logger.debug(`websocket message published topic=${topicString}`)
          return
        }
        case 'unsubscribe': {
          const topicString = toTopicString(toServerMsg.topicName, toServerMsg.topicParams)
          ws.unsubscribe(topicString)
          logger.debug(
            `websocket message unsubscribed ${topicString} subscriberCount=${bunServer.subscriberCount(topicString)} clientId=${ws.data.clientId} sessionId=${ws.data.sessionId} `,
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
    bunServer = server as Bun.Server
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
          publish: (topicParams: s.Infer<typeof topicConfig.params>, msg: s.Infer<typeof topicConfig.msg>) => {
            const topicString = toTopicString(topicName, topicParams)
            publish(
              topicString,
              {
                t: 'published',
                topicName,
                topicParams,
                msg: JSON.stringify(msg),
              },
              null,
            )
            const existingSub = subByTopic.get(topicString)
            if (!existingSub) {
              logger.debug(`no subscribers for topic=${topicString}`)
              return
            }
            logger.debug(`publishing message to topic=${topicString}`)
            existingSub.pub(msg)
          },
          subscribe: <TMsg>(
            topicParams: s.Infer<typeof topicConfig.params>,
            mapper: (msg: s.Infer<typeof topicConfig.msg> & MsgMeta) => TMsg,
          ): Sub<TMsg> => {
            const topicString = toTopicString(topicName, topicParams)

            const existingSub = subByTopic.get(topicString)

            if (existingSub) {
              logger.debug(`reusing existing subscription for topic=${topicString}`)
              return existingSub as Sub<TMsg>
            }

            logger.debug(`subscribing to topic=${topicString}`)
            const pubSubInitial: PubSub<any> = PubSub.create()
            const pubSub: PubSub<any> = {
              ...pubSubInitial,
              sub(subscriber) {
                const unsub = pubSubInitial.sub((msg) => subscriber(mapper(msg)))
                return () => {
                  unsub()
                  logger.debug(`unsubscribing from topic=${topicString}`)
                }
              },
            }

            subByTopic.set(topicString, pubSub)

            return pubSub as Sub<TMsg>
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
