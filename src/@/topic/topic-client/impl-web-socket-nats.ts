import { NatsConnection, Subscription, wsconnect } from '@nats-io/nats-core'
import { ILogger } from '~/@/logger'
import { p } from '~/@/promise'
import { PubSub, Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { Url } from '~/@/url/url'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { TopicContractBase } from '../topic-contract'
import { ITopicMsgCodec } from '../topic-msg-codec'
import { TopicNameSubscription } from '../topic-name-subscription'
import { TopicName, TopicParams, TopicString } from '../topic-string'
import { TopicSubscription } from '../topic-subscription'
import { ITopicClient, TopicClientNode } from './interface'

export type ImplWebSocketsNats<T extends TopicContractBase> = {
  t: 'web-sockets-nats'
  contract: T
  getServerUrls: () => Promise<Url[]>
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

          clientCore.sendToServer.pub({ topicName, topicParams, msg })

          const subscription = clientCore.subscriptionsByTopic.get(topic)

          subscription?.pubSub.pub(msg)
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
  const sendToServer = Sub.init<{ topicName: TopicName; topicParams: TopicParams; msg: Uint8Array | string }>()
  const subscriptionsByTopic = new Map<TopicString, TopicSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription>()

  const worker = async () => {
    while (true) {
      const abortController = new AbortController()
      try {
        logger.info('connecting to server')

        const serverUrls = await config.getServerUrls()

        logger.info('connecting to server', { serverUrls })

        const connection = await wsconnect({
          servers: serverUrls,
        })

        await workerSenderReceiver(abortController.signal, connection)

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

  const workerSenderReceiver = async (s: AbortSignal, connection: NatsConnection) => {
    workerSender(s, connection)
    workerSyncTopic(s, connection)
    workerSyncTopicName(s, connection)
  }

  const workerSyncTopic = async (s: AbortSignal, connection: NatsConnection) => {
    const natsSubscriptionsByTopicString = new Map<TopicString, Subscription>()
    while (true) {
      s.throwIfAborted()

      for (const [topic, { topicName, topicParams, pubSub }] of subscriptionsByTopic.entries()) {
        const isSubbedServer = natsSubscriptionsByTopicString.has(topic)
        const isSubbedClient = pubSub.subscriberCount() > 0

        if (isSubbedClient && !isSubbedServer) {
          const topicString = TopicString.init(topicName, topicParams)
          const subscription = connection.subscribe(topicString)
          natsSubscriptionsByTopicString.set(topic, subscription)
          workerConsumeSubscription(s, subscription, topicString)
          continue
        }

        if (!isSubbedClient && isSubbedServer) {
          natsSubscriptionsByTopicString.get(topic)?.unsubscribe()
          continue
        }
      }

      await p.sleep(config.syncSubscriptionRate, s)
    }
  }

  const workerSyncTopicName = async (s: AbortSignal, connection: NatsConnection) => {
    const natsSubscriptionsByTopicName = new Map<TopicName, Subscription>()

    while (true) {
      s.throwIfAborted()

      for (const [topicName, { pubSub }] of subscriptionsByTopicName.entries()) {
        const isSubbedServer = natsSubscriptionsByTopicName.has(topicName)
        const isSubbedClient = pubSub.subscriberCount() > 0

        if (isSubbedClient && !isSubbedServer) {
          const topicString = toSubAll(topicName)
          const subscription = connection.subscribe(topicString)
          natsSubscriptionsByTopicName.set(topicName, subscription)
          workerConsumeSubscription(s, subscription, topicString)
          continue
        }

        if (!isSubbedClient && isSubbedServer) {
          natsSubscriptionsByTopicName.get(topicName)?.unsubscribe()
          natsSubscriptionsByTopicName.delete(topicName)
          continue
        }
      }

      await p.sleep(config.syncSubscriptionRate, s)
    }
  }

  const workerSender = async (s: AbortSignal, connection: NatsConnection) => {
    Sub.takeEvery(s, sendToServer, (toServer) => {
      const topicString = TopicString.init(toServer.topicName, toServer.topicParams)
      connection.publish(topicString, toServer.msg)
    })
  }

  const workerConsumeSubscription = async (s: AbortSignal, subscription: Subscription, topicString: TopicString) => {
    for await (const msg of subscription) {
      s.throwIfAborted()
      const sub = subscriptionsByTopic.get(topicString)
      sub?.pubSub.pub(msg.data)
    }
  }

  worker()

  return {
    subscriptionsByTopic,
    subscriptionsByTopicName,
    sendToServer,
  }
}

const toSubAll = (topicName: TopicName): TopicString => {
  return TopicString.fromString(`${topicName}.*`)
}

export const ImplWebSocketsNats = {
  init,
}
