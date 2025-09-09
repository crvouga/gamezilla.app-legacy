import { wsconnect } from '@nats-io/nats-core'
import { ILogger } from '~/@/logger'
import { p } from '~/@/promise'
import { PubSub, Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { Url } from '~/@/url/url'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { TopicContractBase } from '../topic-contract'
import { ITopicMsgCodec } from '../topic-msg-codec'
import { TopicNameSubscription } from '../topic-name-subscription'
import { TopicName, TopicString } from '../topic-string'
import { TopicSubscription } from '../topic-subscription'
import { ITopicClient, TopicClientNode } from './interface'

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
  const msgsToServer = Sub.init<any>()
  const subscriptionsByTopic = new Map<TopicString, TopicSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription>()

  const worker = async () => {
    while (true) {
      const abortController = new AbortController()
      try {
        logger.info('connecting to server')

        const connection = await wsconnect({ servers: [config.natsServerUrl] })

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

  worker()

  return {
    subscriptionsByTopic,
    subscriptionsByTopicName,
    msgsToServer,
    // connection,
    // subscriptions,
  }
}

export const ImplWebSocketsNats = {
  init,
}
