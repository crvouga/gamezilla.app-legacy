import type { IHttpServer, IWebSocketConnection } from '~/@/http-server/interface'
import { ILogger } from '~/@/logger'
import { ITopicBasedPubSub } from '~/@/pub-sub-topic-based'
import { isErr } from '~/@/result'
import { s } from '~/@/schema'
import { Sub } from '~/@/sub'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionId } from '~/@/wire/session-id'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { PUB, SUB, SUB_ALL, ToClientMsgMany, ToClientMsgOne, ToServerMsg, UNSUB, UNSUB_ALL } from '../msgs'
import { TopicClientData } from '../topic-client/types'
import { TopicContractBase } from '../topic-contract'
import { ITopicMsgCodec } from '../topic-msg-codec'
import { TopicNameSubscription } from '../topic-name-subscription'
import { TopicName, TopicParams, TopicString } from '../topic-string'
import { TopicSubscription } from '../topic-subscription'

type ServerSubscription = {
  clients: Set<ClientId | undefined>
}

export type TopicServer<TContract extends TopicContractBase> = {
  t: 'web-sockets'
  contract: TContract
  httpServer: IHttpServer
  logger: ILogger
  endpoint: string
  codec: ITopicMsgCodec
  pubSub: ITopicBasedPubSub
}

export type ITopicServer<TContract extends TopicContractBase> = {
  _subscriptionsByTopic: Map<TopicString, TopicSubscription & ServerSubscription>
  _subscriptionsByTopicName: Map<TopicName, TopicNameSubscription & ServerSubscription>
  _clients: Map<ClientId, TopicClientData>
  isSubscribed: <TTopicName extends keyof TContract>(
    topicName: TTopicName,
    topicParams: s.Infer<TContract[TTopicName]['params']>,
    match: (client: TopicClientData) => boolean,
  ) => boolean
  publishTopicName: (
    topicName: TopicName,
    encodedMsg: string | Buffer,
    decodedMsg: ToClientMsgMany,
    sourceConnection: IWebSocketConnection<TopicClientData> | null,
  ) => void
  publishTopic: (
    topic: TopicString,
    encodedMsg: string | Buffer,
    decodedMsg: ToClientMsgMany,
    sourceConnection: IWebSocketConnection<TopicClientData> | null,
  ) => void
}

const init = <TContract extends TopicContractBase>(config: TopicServer<TContract>): ITopicServer<TContract> => {
  const logger = config.logger.child(['topic-server'])
  const subscriptionsByTopic = new Map<TopicString, TopicSubscription & ServerSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription & ServerSubscription>()
  const clients = new Map<ClientId, TopicClientData>()

  const getSubscriptionByTopic = (topicName: TopicName, topicParams: TopicParams) => {
    const topicString = TopicString.init(topicName, topicParams)
    const got = subscriptionsByTopic.get(topicString)
    if (got) return got
    const newSub: TopicSubscription & ServerSubscription = {
      clients: new Set(),
      pubSub: Sub.init(),
      topicName,
      topicParams,
    }
    subscriptionsByTopic.set(topicString, newSub)
    return newSub
  }

  const getSubscriptionByTopicName = (topicName: TopicName) => {
    const got = subscriptionsByTopicName.get(topicName)
    if (got) return got
    const newSub: TopicNameSubscription & ServerSubscription = {
      clients: new Set(),
      pubSub: Sub.init(),
      topicName,
    }
    subscriptionsByTopicName.set(topicName, newSub)
    return newSub
  }

  // Register WebSocket handler with the HTTP server
  const wsServer = config.httpServer.registerWebSocketHandler<TopicClientData>(config.endpoint, {
    async onConnection(_connection, request) {
      const maybeSessionId = SessionIdHttp.fromRequest(request)
      const sessionId = maybeSessionId ? maybeSessionId : SessionId.generate()

      const maybeClientSessionId = ClientSessionIdHttp.fromRequest(request)
      const clientSessionId = maybeClientSessionId ?? ClientSessionId.generate()

      const clientId = ClientId.generate()

      const topicClientData: TopicClientData = {
        clientId,
        sessionId,
        clientSessionId,
      }

      clients.set(clientId, topicClientData)

      return topicClientData
    },

    async onMessage(connection, message) {
      try {
        const decodedMsg: ToServerMsg = config.codec.decodeMessageServer(message) as ToServerMsg

        logger.debug('received', decodedMsg)

        switch (decodedMsg[0]) {
          case SUB: {
            const topic = TopicString.init(decodedMsg[1], decodedMsg[2])
            connection.subscribe(topic)
            send(connection, decodedMsg)
            getSubscriptionByTopic(decodedMsg[1], decodedMsg[2]).clients.add(connection.data?.clientId)
            return
          }
          case UNSUB: {
            const topic = TopicString.init(decodedMsg[1], decodedMsg[2])
            connection.unsubscribe(topic)
            send(connection, decodedMsg)
            getSubscriptionByTopic(decodedMsg[1], decodedMsg[2]).clients.delete(connection.data?.clientId)
            return
          }
          case SUB_ALL: {
            const topicName = decodedMsg[1]
            connection.subscribe(topicName)
            send(connection, decodedMsg)
            getSubscriptionByTopicName(topicName).clients.add(connection.data?.clientId)
            return
          }
          case UNSUB_ALL: {
            const topicName = decodedMsg[1]
            connection.unsubscribe(topicName)
            send(connection, decodedMsg)
            getSubscriptionByTopicName(topicName).clients.delete(connection.data?.clientId)
            return
          }
          case PUB: {
            const topic = TopicString.init(decodedMsg[1], decodedMsg[2])
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

  const send = (connection: IWebSocketConnection<TopicClientData>, decodedMsg: ToClientMsgOne) => {
    const encodedMsg = config.codec.encode(decodedMsg)
    logger.debug('send', encodedMsg)
    connection.send(encodedMsg as string | Buffer)
  }

  const publishTopic = (
    topic: TopicString,
    encodedMsg: string | Buffer,
    decodedMsg: ToClientMsgMany,
    sourceConnection: IWebSocketConnection<TopicClientData> | null,
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
    sourceConnection: IWebSocketConnection<TopicClientData> | null,
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

  const isSubscribed: ITopicServer<TContract>['isSubscribed'] = (topicName, topicParams, match) => {
    const maybeTopicName = TopicName.parse(topicName)

    if (isErr(maybeTopicName)) return false
    const maybeTopicParams = TopicParams.parse(topicParams)
    if (isErr(maybeTopicParams)) return false

    const topicString = TopicString.init(maybeTopicName.value, maybeTopicParams.value)
    const subscription = subscriptionsByTopic.get(topicString)

    if (!subscription) return false

    for (const clientId of subscription.clients) {
      if (!clientId) continue

      const client = clients.get(clientId)

      if (!client) continue

      if (match(client)) return true
    }

    return false
  }

  return {
    _subscriptionsByTopic: subscriptionsByTopic,
    _subscriptionsByTopicName: subscriptionsByTopicName,
    _clients: clients,
    isSubscribed,
    publishTopic,
    publishTopicName,
  }
}

export const TopicServer = {
  init,
}
