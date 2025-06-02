import { ILogger } from '~/@/logger'
import { PubSub, Sub } from '~/@/sub'
import { Client, ClientNode, ContractBase } from '../types'
import { Topic, TopicName, toTopic } from './topic'
import { TopicNameSubscription } from './topic-name-subscription'
import { TopicSubscription } from './topic-subscription'

export type Config<TContract extends ContractBase> = {
  t: 'local'
  contract: TContract
  logger: ILogger
}

export const initClient = <TContract extends ContractBase>(config: Config<TContract>): Client<TContract> => {
  const subscriptionsByTopic = new Map<Topic, TopicSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription>()

  const client = Object.entries(config.contract)
    .map(([topicName_, _topic]) => {
      const topicName = topicName_ as TopicName

      const clientNode: ClientNode<TContract, typeof topicName> = {
        pub(topicParams, msg) {
          const topic = toTopic(topicName, topicParams)

          const subscription = subscriptionsByTopic.get(topic)

          if (!subscription) return

          subscription.pubSub.pub(msg)

          const subscriptionByName = subscriptionsByTopicName.get(topicName)

          if (!subscriptionByName) return

          subscriptionByName.pubSub.pub(msg)
        },
        sub(topicParams, mapper) {
          const topic = toTopic(topicName, topicParams)

          const subscription = subscriptionsByTopic.get(topic)

          if (subscription) return subscription.pubSub

          const pubSub = Sub.create<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          subscriptionsByTopic.set(topic, {
            pubSub: pubSubMapped,
            topicName,
            topicParams,
          })

          return pubSubMapped
        },
        subAll(mapper) {
          const subscription = subscriptionsByTopicName.get(topicName)

          if (subscription) return subscription.pubSub

          const pubSub = Sub.create<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          subscriptionsByTopicName.set(topicName, {
            pubSub: pubSubMapped,
            topicName,
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
