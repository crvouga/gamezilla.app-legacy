import { connect, NatsConnection } from 'nats'
import { ILogger } from '~/@/logger'
import { p } from '~/@/promise'
import { PubSub, Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { Url } from '~/@/url/url'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { PUB, SUB, SUB_ALL, ToClientMsg, ToServerMsg, UNSUB, UNSUB_ALL } from '../msgs'
import { Socket } from '../socket'
import { TopicContractBase } from '../topic-contract'
import { ITopicMsgCodec } from '../topic-msg-codec'
import { TopicNameSubscription } from '../topic-name-subscription'
import { TopicName, TopicString } from '../topic-string'
import { TopicSubscription } from '../topic-subscription'
import { ITopicClient, TopicClientNode } from './types'

export type ImplWebSocketsNats<T extends TopicContractBase> = {
  t: 'web-sockets-nats'
  contract: T
  natsServerUrl: Url
  clientSessionId: ClientSessionId
  logger: ILogger
  reconnectionRate: TimeSpan
  syncSubscriptionRate: TimeSpan
  codec: ITopicMsgCodec
}

const init = <TContract extends TopicContractBase>(config: ImplWebSocketsNats<TContract>): ITopicClient<TContract> => {
  const clientCore = initClientCore(config)

  const client = Object.entries(config.contract)
    .map(([topicName_, _topic]) => {
      const topicName = topicName_ as TopicName

      const clientNode: TopicClientNode<TContract, typeof topicName> = {
        pub(topicParams, msg) {
          const topic = TopicString.init(topicName, topicParams)

          clientCore.msgsToServer.pub([PUB, topicName, topicParams, msg])

          const subscription = clientCore.subscriptionsByTopic.get(topic)

          if (!subscription) return

          subscription.pubSub.pub(msg)
        },
        sub(topicParams, mapper) {
          const topic = TopicString.init(topicName, topicParams)

          const subscription = clientCore.subscriptionsByTopic.get(topic)

          if (subscription) return subscription.pubSub

          const pubSub = Sub.init<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          clientCore.subscriptionsByTopic.set(topic, {
            topicName,
            topicParams,
            pubSub: pubSubMapped,
          })

          return pubSubMapped
        },
        subAll(mapper) {
          const subscription = clientCore.subscriptionsByTopicName.get(topicName)

          if (subscription) return subscription.pubSub

          const pubSub = Sub.init<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          clientCore.subscriptionsByTopicName.set(topicName, {
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
    }, {} as ITopicClient<TContract>)

  return client
}

const initClientCore = <TContract extends TopicContractBase>(config: ImplWebSocketsNats<TContract>) => {
  const logger = config.logger.child(['topic', 'client'])
  const msgsToServer = Sub.init<ToServerMsg>()
  const subscriptionsByTopic = new Map<TopicString, TopicSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription>()

  const worker = async () => {
    while (true) {
      const abortController = new AbortController()
      try {
        logger.info('connecting to server')

        const connection = await connect({ servers: [config.natsServerUrl] })

        await workerConnection(abortController.signal, connection)

        await connection.close()
      } catch (e) {
        logger.error('worker error', e)
      } finally {
        logger.info('restarting connection')
        abortController.abort('reconnecting')
        await p.sleep(config.reconnectionRate, abortController.signal)
      }
    }
  }

  const workerConnection = async (_s: AbortSignal, _connection: NatsConnection) => {
    logger.info('waiting for connection')
  }
  const workerSenderReceiver = async (s: AbortSignal, socket: Socket) => {
    const send = (msg: ToServerMsg) => {
      const encoded = config.codec.encode(msg)
      socket.send(encoded)
    }
    workerSender(s, send)
    workerReceiver(s, socket)
    workerSyncTopic(s, send)
    workerSyncTopicName(s, send)
  }
  workerSenderReceiver

  const workerSyncTopic = async (s: AbortSignal, send: (msg: ToServerMsg) => void) => {
    const subscribedTopicsServer = new Set<string>()
    while (true) {
      s.throwIfAborted()

      for (const [topic, { topicName, topicParams, pubSub }] of subscriptionsByTopic.entries()) {
        const isSubbedServer = subscribedTopicsServer.has(topic)
        const isSubbedClient = pubSub.subscriberCount() > 0

        if (isSubbedClient && !isSubbedServer) {
          send([SUB, topicName, topicParams])
          subscribedTopicsServer.add(topic)
          continue
        }

        if (!isSubbedClient && isSubbedServer) {
          send([UNSUB, topicName, topicParams])
          subscribedTopicsServer.delete(topic)
          continue
        }
      }

      await p.sleep(config.syncSubscriptionRate, s)
    }
  }

  const workerSyncTopicName = async (s: AbortSignal, send: (msg: ToServerMsg) => void) => {
    const subscribedTopicsServer = new Set<string>()

    while (true) {
      s.throwIfAborted()

      for (const [topicName, { pubSub }] of subscriptionsByTopicName.entries()) {
        const isSubbedServer = subscribedTopicsServer.has(topicName)
        const isSubbedClient = pubSub.subscriberCount() > 0

        if (isSubbedClient && !isSubbedServer) {
          send([SUB_ALL, topicName])
          subscribedTopicsServer.add(topicName)
          continue
        }

        if (!isSubbedClient && isSubbedServer) {
          send([UNSUB_ALL, topicName])
          subscribedTopicsServer.delete(topicName)
          continue
        }
      }

      await p.sleep(config.syncSubscriptionRate, s)
    }
  }

  const workerSender = async (s: AbortSignal, send: (msg: ToServerMsg) => void) => {
    Sub.takeEvery(s, msgsToServer, (toServer) => {
      switch (toServer[0]) {
        case PUB: {
          send(toServer)
          return
        }
      }
    })
  }

  const workerReceiver = async (s: AbortSignal, socket: Socket) => {
    Sub.takeEvery(s, socket.msgsFromServer, async (fromServer) => {
      const fromServerParsed = (await config.codec.decodeMessageClient(fromServer)) as ToClientMsg

      switch (fromServerParsed[0]) {
        case PUB: {
          const topic = TopicString.init(fromServerParsed[1], fromServerParsed[2])
          const subscription = subscriptionsByTopic.get(topic)
          if (!subscription) return
          subscription.pubSub.pub(fromServerParsed[3])
          return
        }
      }
    })
  }

  worker()

  return {
    subscriptionsByTopic,
    subscriptionsByTopicName,
    msgsToServer,
  }
}

export const ImplWebSocketsNats = {
  init,
}
