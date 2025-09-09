import { ILogger } from '~/@/logger'
import { PubSub, Sub } from '~/@/sub'
import { TopicContractBase } from '../topic-contract'
import { ITopicMsgCodec } from '../topic-msg-codec'
import { ITopicServer } from '../topic-server/interface'
import { TopicName, TopicString } from '../topic-string'
import { PUB, ToClientMsgMany } from '../web-socket-msgs'
import { ITopicClient, TopicClientNode } from './interface'

export type ImplFromServer<TContract extends TopicContractBase> = {
  t: 'from-server'
  topicServer: ITopicServer<TContract>
  contract: TContract
  codec: ITopicMsgCodec
  logger: ILogger
}

const init = <TContract extends TopicContractBase>(config: ImplFromServer<TContract>): ITopicClient<TContract> => {
  const { topicServer } = config

  const client = Object.entries(config.contract)
    .map(([topicName_, _topic]) => {
      const topicName = topicName_ as TopicName

      const clientNode: TopicClientNode<TContract, typeof topicName> = {
        pub(topicParams, msg) {
          const topic = TopicString.init(topicName, topicParams)

          const decodedMsg: ToClientMsgMany = [PUB, topicName, topicParams, msg]
          const encodedMsg = config.codec.encode(decodedMsg) as string | Buffer

          topicServer.publishTopicName(topicName, encodedMsg, decodedMsg, null)
          topicServer.publishTopic(topic, encodedMsg, decodedMsg, null)
        },
        sub(topicParams, mapper) {
          const topic = TopicString.init(topicName, topicParams)

          const subscription = topicServer._subscriptionsByTopic.get(topic)

          if (subscription) return subscription.pubSub

          const pubSub = Sub.init<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          topicServer._subscriptionsByTopic.set(topic, {
            topicName,
            topicParams,
            pubSub: pubSubMapped,
            clients: new Set(),
          })

          return pubSubMapped
        },

        subAll(mapper) {
          const subscription = topicServer._subscriptionsByTopicName.get(topicName)

          if (subscription) return subscription.pubSub

          const pubSub = Sub.init<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          topicServer._subscriptionsByTopicName.set(topicName, {
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

export const ImplFromServer = {
  init,
}
