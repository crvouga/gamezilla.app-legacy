import { ILogger } from '~/@/logger'
import { PubSub, Sub } from '~/@/sub'
import { Client, ClientNode, ContractBase } from '../types'
import { toTopicString } from './shared'

export type Config<TContract extends ContractBase> = {
  t: 'local'
  contract: TContract
  logger: ILogger
}

export const initClient = <TContract extends ContractBase>(config: Config<TContract>): Client<TContract> => {
  const activeSubscriptions = new Map<string, PubSub<any>>()

  const client = Object.entries(config.contract)
    .map(([topicName, _topic]) => {
      const clientNode: ClientNode<TContract, typeof topicName> = {
        pub(topicParams, msg) {
          const topicString = toTopicString(topicName, topicParams)

          const existing = activeSubscriptions.get(topicString)

          if (!existing) return

          existing.pub(msg)
        },
        sub(topicParams, mapper) {
          const topicString = toTopicString(topicName, topicParams)

          const existing = activeSubscriptions.get(topicString)

          if (existing) return existing

          const pubSub = Sub.create<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          activeSubscriptions.set(topicString, pubSubMapped)

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
