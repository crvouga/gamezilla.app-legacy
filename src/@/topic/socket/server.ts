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
import { PUB, SUB, SUB_ALL, ToClientMsg, ToClientMsgMany, ToClientMsgOne, UNSUB, UNSUB_ALL } from './msgs'
import { Topic, TopicName, toTopic } from './topic'
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
}

export const initServer = <TContract extends ContractBase>(config: Config<TContract>): Client<TContract> => {
  const serverCore = initServerCore(config)

  const client = Object.entries(config.contract)
    .map(([topicName_, _topic]) => {
      const topicName = topicName_ as TopicName

      const clientNode: ClientNode<TContract, typeof topicName> = {
        pub(topicParams, msg) {
          const topic = toTopic(topicName, topicParams)

          serverCore.publishTopicName(topicName, [PUB, topicName, topicParams, msg], null)
          serverCore.publishTopic(topic, [PUB, topicName, topicParams, msg], null)

          serverCore.subscriptionsByTopic.get(topic)?.pubSub.pub(msg)
          serverCore.subscriptionsByTopicName.get(topicName)?.pubSub.pub(msg)
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

const initServerCore = <TContract extends ContractBase>(config: Config<TContract>) => {
  let bunServer: Bun.Server
  const subscriptionsByTopic = new Map<string, TopicSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription>()

  const send = (ws: ServerWebSocket<BackendWebSocketData>, msg: ToClientMsgOne) => {
    const msgString = JSON.stringify(msg)

    ws.send(msgString)
  }

  const publishTopic = (topic: Topic, msg: ToClientMsgMany, ws: ServerWebSocket<BackendWebSocketData> | null) => {
    bunServer.publish(topic, JSON.stringify(msg))

    subscriptionsByTopic.get(topic)?.pubSub.pub({
      ...msg[3],
      clientId: ws?.data.clientId,
      sessionId: ws?.data.sessionId,
      clientSessionId: ws?.data.clientSessionId,
    })
  }

  const publishTopicName = (
    topicName: TopicName,
    msg: ToClientMsgMany,
    ws: ServerWebSocket<BackendWebSocketData> | null,
  ) => {
    bunServer.publish(topicName, JSON.stringify(msg))

    subscriptionsByTopicName.get(topicName)?.pubSub.pub({
      ...msg[3],
      clientId: ws?.data.clientId,
      sessionId: ws?.data.sessionId,
      clientSessionId: ws?.data.clientSessionId,
    })
  }

  config.httpServer._setWebSocketHandler({
    async message(ws: ServerWebSocket<BackendWebSocketData>, message: string) {
      const msg: ToClientMsg = JSON.parse(message)

      switch (msg[0]) {
        case SUB: {
          const topic = toTopic(msg[1], msg[2])
          ws.subscribe(topic)
          send(ws, msg)
          return
        }
        case UNSUB: {
          const topic = toTopic(msg[1], msg[2])
          ws.unsubscribe(topic)
          send(ws, msg)
          return
        }
        case SUB_ALL: {
          const topicName = msg[1]
          ws.subscribe(topicName)
          send(ws, msg)
          return
        }
        case UNSUB_ALL: {
          const topicName = msg[1]
          ws.unsubscribe(topicName)
          send(ws, msg)
          return
        }
        case PUB: {
          const topic = toTopic(msg[1], msg[2])
          publishTopic(topic, msg, ws)
          publishTopicName(msg[1], msg, ws)
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
