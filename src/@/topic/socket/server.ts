import type { IHttpServer, IWebSocketConnection } from '~/@/http-server/interface'
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
  httpServer: IHttpServer
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
          const encodedMsg = config.codec.encode(decodedMsg) as string | Buffer

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

const initServerCore = <TContract extends ContractBase>(config: Config<TContract>) => {
  const subscriptionsByTopic = new Map<string, TopicSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription>()

  // Register WebSocket handler with the HTTP server
  const wsServer = config.httpServer.registerWebSocketHandler<BackendWebSocketData>(config.endpoint, {
    async onConnection(_connection, request) {
      const maybeSessionId = SessionIdHttp.fromRequest(request)
      const sessionId = maybeSessionId ? maybeSessionId : SessionId.generate()

      const maybeClientSessionId = ClientSessionIdHttp.fromRequest(request)
      const clientSessionId = maybeClientSessionId ?? ClientSessionId.generate()

      const clientId = ClientId.generate()

      return {
        clientId,
        sessionId,
        clientSessionId,
      }
    },

    async onMessage(connection, message) {
      try {
        const decodedMsg: ToServerMsg = config.codec.decodeMessageServer(message) as ToServerMsg

        switch (decodedMsg[0]) {
          case SUB: {
            const topic = toTopic(decodedMsg[1], decodedMsg[2])
            connection.subscribe(topic)
            send(connection, decodedMsg)
            return
          }
          case UNSUB: {
            const topic = toTopic(decodedMsg[1], decodedMsg[2])
            connection.unsubscribe(topic)
            send(connection, decodedMsg)
            return
          }
          case SUB_ALL: {
            const topicName = decodedMsg[1]
            connection.subscribe(topicName)
            send(connection, decodedMsg)
            return
          }
          case UNSUB_ALL: {
            const topicName = decodedMsg[1]
            connection.unsubscribe(topicName)
            send(connection, decodedMsg)
            return
          }
          case PUB: {
            const topic = toTopic(decodedMsg[1], decodedMsg[2])
            publishTopic(topic, message, decodedMsg, connection)
            publishTopicName(decodedMsg[1], message, decodedMsg, connection)
            return
          }
        }
      } catch (error) {
        config.logger.error('WebSocket message handling error:', error)
      }
    },

    async onClose(_connection, code, reason) {
      config.logger.debug(`WebSocket connection closed: ${code} ${reason}`)
    },

    async onError(_connection, error) {
      config.logger.error('WebSocket connection error:', error)
    },
  })

  const send = (connection: IWebSocketConnection<BackendWebSocketData>, decodedMsg: ToClientMsgOne) => {
    const encodedMsg = config.codec.encode(decodedMsg)
    connection.send(encodedMsg as string | Buffer)
  }

  const publishTopic = (
    topic: Topic,
    encodedMsg: string | Buffer,
    decodedMsg: ToClientMsgMany,
    sourceConnection: IWebSocketConnection<BackendWebSocketData> | null,
  ) => {
    // Publish to all connections subscribed to this topic
    wsServer.publish(topic, encodedMsg)

    // Notify local subscribers
    subscriptionsByTopic.get(topic)?.pubSub.pub({
      ...decodedMsg[3],
      clientId: sourceConnection?.data?.clientId,
      sessionId: sourceConnection?.data?.sessionId,
      clientSessionId: sourceConnection?.data?.clientSessionId,
    })
  }

  const publishTopicName = (
    topicName: TopicName,
    encodedMsg: string | Buffer,
    decodedMsg: ToClientMsgMany,
    sourceConnection: IWebSocketConnection<BackendWebSocketData> | null,
  ) => {
    // Publish to all connections subscribed to this topic name
    wsServer.publish(topicName, encodedMsg)

    // Notify local subscribers
    subscriptionsByTopicName.get(topicName)?.pubSub.pub({
      ...decodedMsg[3],
      clientId: sourceConnection?.data?.clientId,
      sessionId: sourceConnection?.data?.sessionId,
      clientSessionId: sourceConnection?.data?.clientSessionId,
    })
  }

  return {
    subscriptionsByTopic,
    subscriptionsByTopicName,
    publishTopic,
    publishTopicName,
  }
}
