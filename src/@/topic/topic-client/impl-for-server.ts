import { PubSub, Sub } from '~/@/sub'
import { PUB, ToClientMsgMany } from '../msgs'
import { ContractBase } from '../topic-contract'
import { TopicMsgCodec } from '../topic-msg-codec'
import { ITopicServer } from '../topic-server'
import { TopicName, TopicString } from '../topic-string'
import { TopicClientNode, ITopicClient } from './types'

export type ImplForServer<TContract extends ContractBase> = {
  t: 'for-server'
  server: ITopicServer
  contract: TContract
  codec: TopicMsgCodec
}

const init = <TContract extends ContractBase>(config: ImplForServer<TContract>): ITopicClient<TContract> => {
  const serverCore = config.server

  const client = Object.entries(config.contract)
    .map(([topicName_, _topic]) => {
      const topicName = topicName_ as TopicName

      const clientNode: TopicClientNode<TContract, typeof topicName> = {
        pub(topicParams, msg) {
          const topic = TopicString.init(topicName, topicParams)

          const decodedMsg: ToClientMsgMany = [PUB, topicName, topicParams, msg]
          const encodedMsg = config.codec.encode(decodedMsg) as string | Buffer

          serverCore.publishTopicName(topicName, encodedMsg, decodedMsg, null)
          serverCore.publishTopic(topic, encodedMsg, decodedMsg, null)
        },
        sub(topicParams, mapper) {
          const topic = TopicString.init(topicName, topicParams)

          const subscription = serverCore.subscriptionsByTopic.get(topic)

          if (subscription) return subscription.pubSub

          const pubSub = Sub.create<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          serverCore.subscriptionsByTopic.set(topic, {
            topicName,
            topicParams,
            pubSub: pubSubMapped,
            clients: new Set(),
          })

          return pubSubMapped
        },

        subAll(mapper) {
          const subscription = serverCore.subscriptionsByTopicName.get(topicName)

          if (subscription) return subscription.pubSub

          const pubSub = Sub.create<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          serverCore.subscriptionsByTopicName.set(topicName, {
            topicName,
            pubSub: pubSubMapped,
            clients: new Set(),
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

export const ImplForServer = {
  init,
}
