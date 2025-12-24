import type { IHttpServer, IWebSocketConnection } from '~/@/http-server/interface'
import { ILogger } from '~/@/logger'
import { ITopicBasedPubSub } from '~/@/pub-sub-topic-based'
import { isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionId } from '~/@/wire/session-id'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { TopicClientData } from '../topic-client/interface'
import { TopicContractBase } from '../topic-contract'
import { ITopicMsgCodec } from '../topic-msg-codec'
import { TopicNameSubscription } from '../topic-name-subscription'
import { TopicName, TopicParams, TopicString } from '../topic-string'
import { TopicSubscription } from '../topic-subscription'
import { PUB, SUB, SUB_ALL, ToClientMsgMany, ToClientMsgOne, ToServerMsg, UNSUB, UNSUB_ALL } from '../web-socket-msgs'
import { ITopicServer, ServerSubscription } from './interface'

export type ImplWebSocketInHouse<TContract extends TopicContractBase> = {
  t: 'web-sockets-in-house'
  contract: TContract
  httpServer: IHttpServer
  logger: ILogger
  endpoint: string
  codec: ITopicMsgCodec
  pubSub: ITopicBasedPubSub
}

const init = <TContract extends TopicContractBase>(
  config: ImplWebSocketInHouse<TContract>,
): ITopicServer<TContract> => {
  const logger = config.logger.child(['topic-server'])
  const subscriptionsByTopic = new Map<TopicString, TopicSubscription & ServerSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription & ServerSubscription>()
  const clients = new Map<ClientId, TopicClientData>()

  const getSubscriptionByTopic = (topicName: TopicName, topicParams: TopicParams) => {
    const topicString = TopicString.init(topicName, topicParams)
    const got = subscriptionsByTopic.get(topicString)
    if (got) {
      logger.debug(`Retrieved existing topic subscription for ${topicString}`)
      return got
    }
    logger.info(`Creating new subscription for topic ${topicString}`)
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
    if (got) {
      logger.debug(`Retrieved existing topic name subscription for ${topicName}`)
      return got
    }
    logger.info(`Creating new subscription for topicName ${topicName}`)
    const newSub: TopicNameSubscription & ServerSubscription = {
      clients: new Set(),
      pubSub: Sub.init(),
      topicName,
    }
    subscriptionsByTopicName.set(topicName, newSub)
    return newSub
  }

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

      logger.info(
        `New websocket connection: clientId=${clientId}, sessionId=${sessionId}, clientSessionId=${clientSessionId}`,
      )

      return topicClientData
    },

    async onMessage(connection, message) {
      try {
        const decodedMsg: ToServerMsg = config.codec.decodeMessageServer(message) as ToServerMsg

        logger.debug('received', { msg: decodedMsg, clientId: connection?.data?.clientId })

        switch (decodedMsg[0]) {
          case SUB: {
            const topic = TopicString.init(decodedMsg[1], decodedMsg[2])
            logger.info(`[SUB] clientId=${connection.data?.clientId} subscribing topic=${topic}`)
            connection.subscribe(topic)
            send(connection, decodedMsg)
            getSubscriptionByTopic(decodedMsg[1], decodedMsg[2]).clients.add(connection.data?.clientId)
            return
          }
          case UNSUB: {
            const topic = TopicString.init(decodedMsg[1], decodedMsg[2])
            logger.info(`[UNSUB] clientId=${connection.data?.clientId} unsubscribing topic=${topic}`)
            connection.unsubscribe(topic)
            send(connection, decodedMsg)
            getSubscriptionByTopic(decodedMsg[1], decodedMsg[2]).clients.delete(connection.data?.clientId)
            return
          }
          case SUB_ALL: {
            const topicName = decodedMsg[1]
            logger.info(`[SUB_ALL] clientId=${connection.data?.clientId} subscribing all to topicName=${topicName}`)
            connection.subscribe(topicName)
            send(connection, decodedMsg)
            getSubscriptionByTopicName(topicName).clients.add(connection.data?.clientId)
            return
          }
          case UNSUB_ALL: {
            const topicName = decodedMsg[1]
            logger.info(
              `[UNSUB_ALL] clientId=${connection.data?.clientId} unsubscribing all from topicName=${topicName}`,
            )
            connection.unsubscribe(topicName)
            send(connection, decodedMsg)
            getSubscriptionByTopicName(topicName).clients.delete(connection.data?.clientId)
            return
          }
          case PUB: {
            const topic = TopicString.init(decodedMsg[1], decodedMsg[2])
            logger.info(
              `[PUB] clientId=${connection.data?.clientId} publishing to topic=${topic}; also pub to topicName=${decodedMsg[1]}`,
            )
            publishTopic(topic, message, decodedMsg, connection)
            publishTopicName(decodedMsg[1], message, decodedMsg, connection)
            return
          }
        }
      } catch (error) {
        config.logger.error('WebSocket message handling error:', error)
      }
    },

    async onClose(connection, code, reason) {
      config.logger.info(
        `WebSocket connection closed: clientId=${connection.data?.clientId}, code=${code} reason=${reason}`,
      )
    },

    async onError(connection, error) {
      config.logger.error(`WebSocket connection error: clientId=${connection.data?.clientId ?? 'unknown'}`, error)
    },
  })

  const send = (connection: IWebSocketConnection<TopicClientData>, decodedMsg: ToClientMsgOne) => {
    const encodedMsg = config.codec.encode(decodedMsg)
    logger.debug('send', {
      clientId: connection?.data?.clientId,
      msg: decodedMsg,
      encoded: encodedMsg,
    })
    connection.send(encodedMsg as string | Buffer)
  }

  const publishTopic = (
    topic: TopicString,
    encodedMsg: string | Buffer,
    decodedMsg: ToClientMsgMany,
    sourceConnection: IWebSocketConnection<TopicClientData> | null,
  ) => {
    logger.info(`[publishTopic] Publishing to topic=${topic} from clientId=${sourceConnection?.data?.clientId}`)
    wsServer.publish(topic, encodedMsg)
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
    logger.info(
      `[publishTopicName] Publishing to topicName=${topicName} from clientId=${sourceConnection?.data?.clientId}`,
    )
    wsServer.publish(topicName, encodedMsg)
    subscriptionsByTopicName.get(topicName)?.pubSub.pub({
      ...decodedMsg[3],
      clientId: sourceConnection?.data?.clientId,
      sessionId: sourceConnection?.data?.sessionId,
      clientSessionId: sourceConnection?.data?.clientSessionId,
    })
  }

  const isSubscribed: ITopicServer<TContract>['isSubscribed'] = (topicName, topicParams, match) => {
    const maybeTopicName = TopicName.parse(topicName)

    if (isErr(maybeTopicName)) {
      logger.warn(`[isSubscribed] Failed to parse topicName: ${String(topicName)}`)
      return false
    }
    const maybeTopicParams = TopicParams.parse(topicParams)
    if (isErr(maybeTopicParams)) {
      logger.warn(`[isSubscribed] Failed to parse topicParams: ${JSON.stringify(topicParams)}`)
      return false
    }

    const topicString = TopicString.init(maybeTopicName.value, maybeTopicParams.value)
    const subscription = subscriptionsByTopic.get(topicString)

    if (!subscription) {
      logger.debug(`[isSubscribed] No subscription found for topicString=${topicString}`)
      return false
    }

    for (const clientId of subscription.clients) {
      if (!clientId) continue

      const client = clients.get(clientId)

      if (!client) continue

      if (match(client)) {
        logger.debug(`[isSubscribed] Match found: clientId=${clientId} for topicString=${topicString}`)
        return true
      }
    }

    logger.debug(`[isSubscribed] No matching client found for topicString=${topicString}`)
    return false
  }

  logger.info('WebSocket in-house topic server initialized.')

  return {
    _subscriptionsByTopic: subscriptionsByTopic,
    _subscriptionsByTopicName: subscriptionsByTopicName,
    _clients: clients,
    isSubscribed,
    publishTopic,
    publishTopicName,
  }
}

export const ImplWebSocketInHouse = {
  init,
}
