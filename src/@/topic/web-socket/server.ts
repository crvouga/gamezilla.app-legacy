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
import { Client, ContractBase, MsgMeta, Topic } from '../types'
import { ToClientMsg, ToClientMsgOne, toTopicString } from './shared'

export type BackendWebSocketData = {
  clientId: ClientId
  sessionId: SessionId
  clientSessionId: ClientSessionId
}

export const initServer = <TContract extends ContractBase>(config: {
  t: 'web-sockets'
  contract: TContract
  httpServer: HttpServerBun
  logger: ILogger
  isProd: boolean
  endpoint: string
}): Client<TContract> => {
  const logger = Logger.prefix('server', config.logger)

  let bunServer: Bun.Server

  const subByTopic = new Map<string, PubSub<unknown>>()

  const publish = (topicString: string, payload: unknown, ws: ServerWebSocket<BackendWebSocketData> | null) => {
    const payloadString = JSON.stringify(payload)

    bunServer.publish(topicString, payloadString)

    const existingSub = subByTopic.get(topicString)

    if (!existingSub) {
      return
    }

    if (!ws) {
      existingSub.pub(payload)
      return
    }

    const payloadWithMeta = {
      ...(payload as any),
      clientId: ws.data.clientId,
      sessionId: ws.data.sessionId,
      clientSessionId: ws.data.clientSessionId,
    }

    existingSub.pub(payloadWithMeta)
  }

  config.httpServer._setWebSocketHandler({
    async open(ws: ServerWebSocket<BackendWebSocketData>) {
      logger.debug(`websocket connection opened clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
    },
    async close(ws: ServerWebSocket<BackendWebSocketData>, _code, _message) {
      logger.debug(`websocket connection closed clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}`)
    },
    async message(ws: ServerWebSocket<BackendWebSocketData>, message: string) {
      logger.debug(
        `websocket message received clientId=${ws.data.clientId} sessionId=${ws.data.sessionId} message=${message}`,
      )

      const msg: ToClientMsg = JSON.parse(message)

      switch (msg[0]) {
        case 'sub': {
          ws.subscribe(msg[1])
          const toClientMsg: ToClientMsgOne = ['sub', msg[1]]
          ws.send(JSON.stringify(toClientMsg))
          logger.debug(
            `websocket subscribed ${msg[1]} subscriberCount=${bunServer.subscriberCount(msg[1])} clientId=${ws.data.clientId} sessionId=${ws.data.sessionId} `,
          )
          return
        }
        case 'pub': {
          publish(msg[1], msg[2], ws)
          return
        }
        case 'unsub': {
          ws.unsubscribe(msg[1])
          const toClientMsg: ToClientMsgOne = ['unsub', msg[1]]
          ws.send(JSON.stringify(toClientMsg))
          logger.debug(
            `websocket unsubscribed ${msg[1]} subscriberCount=${bunServer.subscriberCount(msg[1])} clientId=${ws.data.clientId} sessionId=${ws.data.sessionId} `,
          )

          return
        }
        default: {
          logger.warn(
            `Unhandled message type from clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}: ${msg[0]}`,
          )
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
        `${config.endpoint} request received clientId=${clientId} sessionId=${sessionId} headers=${JSON.stringify(Object.fromEntries(headers.entries()))}`,
      )

      bunServer.upgrade(request, { headers, data })

      return
    }

    return null
  })

  const clientProxy = {} as Client<TContract>

  for (const topicName of Object.keys(config.contract)) {
    const topicDefCandidate = config.contract[topicName as keyof TContract]

    if (
      !topicDefCandidate ||
      typeof topicDefCandidate !== 'object' ||
      !('params' in topicDefCandidate && 'msg' in topicDefCandidate)
    ) {
      logger.debug(
        `Skipping entry '${topicName}' in contract as it does not appear to be a valid Topic definition. (Server-side client proxy setup)`,
      )
      continue
    }

    const topicDef = topicDefCandidate as Topic<any, any>

    clientProxy[topicName as keyof TContract] = {
      publish: (topicParams: s.Infer<typeof topicDef.params>, messageContent: s.Infer<typeof topicDef.msg>) => {
        const topicString = toTopicString(topicName, topicParams)
        publish(topicString, JSON.stringify(['pub', topicString, messageContent]), null)
      },
      subscribe: <TMsgOut>(
        topicParams: s.Infer<typeof topicDef.params>,
        mapper: (msgWithOrWithoutMeta: s.Infer<typeof topicDef.msg> & MsgMeta) => TMsgOut,
      ): Sub<TMsgOut> => {
        const topicString = toTopicString(topicName, topicParams)

        let rawPubSub = subByTopic.get(topicString) as PubSub<s.Infer<typeof topicDef.msg> & MsgMeta> | undefined

        if (!rawPubSub) {
          logger.debug(`Creating new internal PubSub for server-side subscriptions to topic=${topicString}`)
          rawPubSub = Sub.create<s.Infer<typeof topicDef.msg> & MsgMeta>()
          subByTopic.set(topicString, rawPubSub as PubSub<unknown>)
        } else {
          logger.debug(`Reusing existing internal PubSub for server-side subscriptions to topic=${topicString}`)
        }

        return {
          sub: (subscriber: (mappedMsg: TMsgOut) => void): (() => void) => {
            const unsub = rawPubSub!.sub((msgFromPubSub) => {
              subscriber(mapper(msgFromPubSub as s.Infer<typeof topicDef.msg> & MsgMeta))
            })
            return () => {
              unsub()
              logger.debug(`Server-side subscriber unsubscribed from mapped Sub for topic=${topicString}`)
            }
          },
        }
      },
    }
  }

  return clientProxy
}
