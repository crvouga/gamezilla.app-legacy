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
import {
  MSG_TYPE_PUB,
  MSG_TYPE_PUBED,
  MSG_TYPE_SUB,
  MSG_TYPE_SUBBED,
  MSG_TYPE_UNSUB,
  ToClientMsgMany,
  ToClientMsgOne,
  ToServerMsg,
  toTopicString,
} from './shared'

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

  const publish = (topicString: string, msg: ToClientMsgMany, ws: ServerWebSocket<BackendWebSocketData> | null) => {
    const encoded = JSON.stringify(msg)

    if (ws) {
      logger.debug(`Forwarding message from clientId=${ws.data.clientId} to topic=${topicString} via Bun.publish`)
    } else {
      logger.debug(`Publishing server-initiated message to topic=${topicString} via Bun.publish`)
    }
    bunServer.publish(topicString, encoded)

    const existingSub = subByTopic.get(topicString)
    if (existingSub) {
      let jsonPayload = JSON.parse(msg[3])
      if (ws) {
        jsonPayload = {
          ...jsonPayload,
          clientId: ws.data.clientId,
          sessionId: ws.data.sessionId,
          clientSessionId: ws.data.clientSessionId,
        }
        logger.debug(
          `Delivering message from clientId=${ws.data.clientId} to local server subscribers of topic=${topicString}`,
        )
      } else {
        logger.debug(`Delivering server-initiated message to local server subscribers of topic=${topicString}`)
      }
      existingSub.pub(jsonPayload)
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
      logger.debug(
        `websocket message received clientId=${ws.data.clientId} sessionId=${ws.data.sessionId} message=${message}`,
      )

      const toServerMsg: ToServerMsg = JSON.parse(message) as ToServerMsg

      switch (toServerMsg[0]) {
        case MSG_TYPE_SUB: {
          const topicString = toTopicString(toServerMsg[1], toServerMsg[2])
          ws.subscribe(topicString)
          const toClientMsg: ToClientMsgOne = [MSG_TYPE_SUBBED, toServerMsg[1], toServerMsg[2]]
          ws.send(JSON.stringify(toClientMsg))
          logger.debug(
            `websocket subscribed ${topicString} subscriberCount=${bunServer.subscriberCount(topicString)} clientId=${ws.data.clientId} sessionId=${ws.data.sessionId} `,
          )
          return
        }
        case MSG_TYPE_PUB: {
          const topicString = toTopicString(toServerMsg[1], toServerMsg[2])
          publish(topicString, [MSG_TYPE_PUBED, toServerMsg[1], toServerMsg[2], toServerMsg[3]], ws)

          return
        }
        case MSG_TYPE_UNSUB: {
          const topicString = toTopicString(toServerMsg[1], toServerMsg[2])
          ws.unsubscribe(topicString)
          logger.debug(
            `websocket unsubscribed ${topicString} subscriberCount=${bunServer.subscriberCount(topicString)} clientId=${ws.data.clientId} sessionId=${ws.data.sessionId} `,
          )

          return
        }
        default: {
          logger.warn(
            `Unhandled message type from clientId=${ws.data.clientId} sessionId=${ws.data.sessionId}: ${toServerMsg[0]}`,
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

  for (const topicFullNameStr of Object.keys(config.contract)) {
    const topicDefCandidate = config.contract[topicFullNameStr as keyof TContract]

    if (
      !topicDefCandidate ||
      typeof topicDefCandidate !== 'object' ||
      !('params' in topicDefCandidate && 'msg' in topicDefCandidate)
    ) {
      logger.debug(
        `Skipping entry '${topicFullNameStr}' in contract as it does not appear to be a valid Topic definition. (Server-side client proxy setup)`,
      )
      continue
    }

    const topicDef = topicDefCandidate as Topic<any, any>

    const topicNameParts = topicFullNameStr.split('/')

    if (topicFullNameStr === '') {
      logger.warn('Encountered Topic definition with empty full name path during client setup. Skipping.')
      continue
    }

    clientProxy[topicFullNameStr as keyof TContract] = {
      publish: (topicParams: s.Infer<typeof topicDef.params>, messageContent: s.Infer<typeof topicDef.msg>) => {
        const topicString = toTopicString(topicNameParts, topicParams)
        publish(topicString, [MSG_TYPE_PUBED, topicNameParts, topicParams, JSON.stringify(messageContent)], null)
      },
      subscribe: <TMsgOut>(
        topicParams: s.Infer<typeof topicDef.params>,
        mapper: (msgWithOrWithoutMeta: s.Infer<typeof topicDef.msg> & MsgMeta) => TMsgOut,
      ): Sub<TMsgOut> => {
        const topicString = toTopicString(topicNameParts, topicParams)

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
