import { ServerWebSocket } from 'bun'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import { ILogger } from '~/@/logger'
import { PubSub, Sub } from '~/@/sub'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionId } from '~/@/wire/session-id'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { Client, ClientNode, ContractBase } from '../types'
import { PUB, SUB, SUB_ALL, ToClientMsgMany, ToClientMsgOne, ToServerMsg, UNSUB, UNSUB_ALL } from './msgs'
import { Topic, TopicName, toTopic } from './topic'
import { TopicMsgCodec } from './topic-msg-codec'
import { TopicNameSubscription } from './topic-name-subscription'
import { TopicSubscription } from './topic-subscription'

export type BackendWebSocketData = {
  clientId: ClientId
  sessionId: SessionId
  clientSessionId: ClientSessionId
}

type Config<TContract extends ContractBase> = {
  t: 'web-sockets'
  contract: TContract
  httpServer: HttpServerBun
  logger: ILogger
  isProd: boolean
  endpoint: string
  codec: TopicMsgCodec
}

export const initServer = <TContract extends ContractBase>(config: Config<TContract>): Client<TContract> => {
  const serverCore = initServerCore(config)

  const client = Object.entries(config.contract)
    .map(([topicName_, _topic]) => {
      const topicName = topicName_ as TopicName

      const clientNode: ClientNode<TContract, typeof topicName> = {
        pub(topicParams, msg) {
          const topic = toTopic(topicName, topicParams)

          const decodedMsg: ToClientMsgMany = [PUB, topicName, topicParams, msg]
          // @ts-expect-error
          const encodedMsg: EncodedMsg = config.codec.encode(decodedMsg)

          serverCore.publishTopicName(topicName, encodedMsg, decodedMsg, null)
          serverCore.publishTopic(topic, encodedMsg, decodedMsg, null)
        },
        sub(topicParams, mapper) {
          const topic = toTopic(topicName, topicParams)

          const subscription = serverCore.subscriptionsByTopic.get(topic)

          if (subscription) return subscription.pubSub

          const pubSub = Sub.create<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          serverCore.subscriptionsByTopic.set(topic, {
            topicName,
            topicParams,
            pubSub: pubSubMapped,
          })

          return pubSubMapped
        },

        subAll(mapper) {
          const subscription = serverCore.subscriptionsByTopicName.get(topicName)

          if (subscription) return subscription.pubSub

          const pubSub = Sub.create<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          serverCore.subscriptionsByTopicName.set(topicName, {
            topicName,
            pubSub: pubSubMapped,
          })

          return pubSubMapped
        },
      }
      return [topicName, clientNode] as const
    })
    .reduce((acc, [topicName, topic]) => {
      acc[topicName as keyof TContract] = topic
      return acc
    }, {} as Client<TContract>)

  return client
}

type EncodedMsg = string | Bun.ArrayBufferView | ArrayBuffer | SharedArrayBuffer

const initServerCore = <TContract extends ContractBase>(config: Config<TContract>) => {
  let bunServer: Bun.Server
  const subscriptionsByTopic = new Map<string, TopicSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription>()

  const send = (ws: ServerWebSocket<BackendWebSocketData>, decodedMsg: ToClientMsgOne) => {
    const encodedMsg = config.codec.encode(decodedMsg)
    ws.send(
      // @ts-expect-error
      encodedMsg,
    )
  }

  const publishTopic = (
    topic: Topic,
    encodedMsg: EncodedMsg,
    decodedMsg: ToClientMsgMany,
    ws: ServerWebSocket<BackendWebSocketData> | null,
  ) => {
    bunServer.publish(topic, encodedMsg)
    subscriptionsByTopic.get(topic)?.pubSub.pub({
      ...decodedMsg[3],
      clientId: ws?.data.clientId,
      sessionId: ws?.data.sessionId,
      clientSessionId: ws?.data.clientSessionId,
    })
  }

  const publishTopicName = (
    topicName: TopicName,
    encodedMsg: EncodedMsg,
    decodedMsg: ToClientMsgMany,
    ws: ServerWebSocket<BackendWebSocketData> | null,
  ) => {
    bunServer.publish(topicName, encodedMsg)
    subscriptionsByTopicName.get(topicName)?.pubSub.pub({
      ...decodedMsg[3],
      clientId: ws?.data.clientId,
      sessionId: ws?.data.sessionId,
      clientSessionId: ws?.data.clientSessionId,
    })
  }

  config.httpServer._setWebSocketHandler({
    async message(ws: ServerWebSocket<BackendWebSocketData>, encodedMsg: EncodedMsg) {
      // @ts-expect-error
      const decodedMsg: ToServerMsg = config.codec.decode(encodedMsg)

      switch (decodedMsg[0]) {
        case SUB: {
          const topic = toTopic(decodedMsg[1], decodedMsg[2])
          ws.subscribe(topic)
          send(ws, decodedMsg)
          return
        }
        case UNSUB: {
          const topic = toTopic(decodedMsg[1], decodedMsg[2])
          ws.unsubscribe(topic)
          send(ws, decodedMsg)
          return
        }
        case SUB_ALL: {
          const topicName = decodedMsg[1]
          ws.subscribe(topicName)
          send(ws, decodedMsg)
          return
        }
        case UNSUB_ALL: {
          const topicName = decodedMsg[1]
          ws.unsubscribe(topicName)
          send(ws, decodedMsg)
          return
        }
        case PUB: {
          const topic = toTopic(decodedMsg[1], decodedMsg[2])
          publishTopic(topic, encodedMsg, decodedMsg, ws)
          publishTopicName(decodedMsg[1], encodedMsg, decodedMsg, ws)
          return
        }
      }
    },
  })

  config.httpServer.registerRespond((request, server) => {
    bunServer = server as Bun.Server

    const url = new URL(request.url)

    if (url.pathname !== config.endpoint) return null

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

    if (bunServer.upgrade(request, { headers, data })) return

    return new Response('Failed to upgrade to WebSocket', { status: 500 })
  })

  return {
    subscriptionsByTopic,
    subscriptionsByTopicName,
    publishTopic,
    publishTopicName,
  }
}
