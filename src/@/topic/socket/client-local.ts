import { ILogger } from '~/@/logger'
import { PubSub, Sub } from '~/@/sub'
import { Client, ClientNode, ContractBase } from '../types'
import { Topic, TopicName, toTopic } from './topic'

export type Config<TContract extends ContractBase> = {
  t: 'local'
  contract: TContract
  logger: ILogger
}

export const initClient = <TContract extends ContractBase>(config: Config<TContract>): Client<TContract> => {
  const subscriptionsByTopic = new Map<Topic, PubSub<any>>()

  const client = Object.entries(config.contract)
    .map(([topicName_, _topic]) => {
      const topicName = topicName_ as TopicName

      const clientNode: ClientNode<TContract, typeof topicName> = {
        pub(topicParams, msg) {
          const topic = toTopic(topicName, topicParams)

          const subscription = subscriptionsByTopic.get(topic)

          if (!subscription) return

          subscription.pub(msg)
        },
        sub(topicParams, mapper) {
          const topic = toTopic(topicName, topicParams)

          const subscription = subscriptionsByTopic.get(topic)

          if (subscription) return subscription

          const pubSub = Sub.create<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          subscriptionsByTopic.set(topic, pubSubMapped)

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
