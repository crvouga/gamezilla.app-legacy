import type { IWebSocketConnection } from '~/@/http-server/interface'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionId } from '~/@/wire/session-id'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { PUB, SUB, SUB_ALL, ToClientMsgMany, ToClientMsgOne, ToServerMsg, UNSUB, UNSUB_ALL } from './msgs'
import { ServerConfig } from './server-config'
import { ContractBase } from './topic-contract'
import { TopicNameSubscription } from './topic-name-subscription'
import { TopicName, TopicString } from './topic-string'
import { TopicSubscription } from './topic-subscription'
import { TopicClientData } from './topic-client/types'

type ServerSubscription = {
  clients: Set<ClientId>
}

export type ITopicServer = {
  subscriptionsByTopic: Map<TopicString, TopicSubscription & ServerSubscription>
  subscriptionsByTopicName: Map<TopicName, TopicNameSubscription & ServerSubscription>
  clients: Map<ClientId, TopicClientData>
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

const init = <TContract extends ContractBase>(config: ServerConfig<TContract>): ITopicServer => {
  const subscriptionsByTopic = new Map<TopicString, TopicSubscription & ServerSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription & ServerSubscription>()

  const clients = new Map<ClientId, TopicClientData>()

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

        switch (decodedMsg[0]) {
          case SUB: {
            const topic = TopicString.init(decodedMsg[1], decodedMsg[2])
            connection.subscribe(topic)
            send(connection, decodedMsg)
            return
          }
          case UNSUB: {
            const topic = TopicString.init(decodedMsg[1], decodedMsg[2])
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

  return {
    subscriptionsByTopic,
    subscriptionsByTopicName,
    publishTopic,
    publishTopicName,
    clients,
  }
}

export const TopicServer = {
  init,
}
