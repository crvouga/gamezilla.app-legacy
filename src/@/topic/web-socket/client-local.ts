import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { PubSub, Sub } from '~/@/sub'
import { Client, ClientNode, ContractBase, MsgMeta } from '../types'
import { toTopicString } from './shared'

export type Config<TContract extends ContractBase> = {
  t: 'local'
  contract: TContract
  logger: ILogger
}

export const initClient = <TContract extends ContractBase>(config: Config<TContract>): Client<TContract> => {
  const activeSubscriptions = new Map<string, PubSub<any>>()

  const client = Object.entries(config.contract)
    .map(([topicName, topic]) => {
      const clientNode: ClientNode<TContract, typeof topicName> = {
        publish: (topicParams, msg) => {
          const topicString = toTopicString(topicName, topicParams)
          const pubSub = activeSubscriptions.get(topicString)
          if (!pubSub) return
          pubSub.pub(msg)
        },
        subscribe: (topicParams, mapper) => {
          const topicString = toTopicString(topicName, topicParams)

          const existing = activeSubscriptions.get(topicString)

          if (existing) return existing

          const pubSub = Sub.create<s.Infer<typeof topic.msg> & MsgMeta>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (subscriber) => {
              const unsub = pubSub.sub((msg) => subscriber(mapper(msg)))
              return () => {
                unsub()
              }
            },
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
