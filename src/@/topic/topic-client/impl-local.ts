import { ILogger } from '~/@/logger'
import { PubSub, Sub } from '~/@/sub'
import { TopicContractBase } from '../topic-contract'
import { TopicNameSubscription } from '../topic-name-subscription'
import { TopicName, TopicString } from '../topic-string'
import { TopicSubscription } from '../topic-subscription'
import { TopicClientNode, ITopicClient } from './types'

export type ImplLocal<TContract extends TopicContractBase> = {
  t: 'local'
  contract: TContract
  logger: ILogger
}

const init = <TContract extends TopicContractBase>(config: ImplLocal<TContract>): ITopicClient<TContract> => {
  const subscriptionsByTopic = new Map<TopicString, TopicSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription>()

  const client = Object.entries(config.contract)
    .map(([topicName_, _topic]) => {
      const topicName = topicName_ as TopicName

      const clientNode: TopicClientNode<TContract, typeof topicName> = {
        pub(topicParams, msg) {
          const topic = TopicString.init(topicName, topicParams)

          const subscription = subscriptionsByTopic.get(topic)

          if (!subscription) return

          subscription.pubSub.pub(msg)

          const subscriptionByName = subscriptionsByTopicName.get(topicName)

          if (!subscriptionByName) return

          subscriptionByName.pubSub.pub(msg)
        },
        sub(topicParams, mapper) {
          const topic = TopicString.init(topicName, topicParams)

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
    }, {} as ITopicClient<TContract>)

  return client
}

export const ImplLocal = {
  init,
}
