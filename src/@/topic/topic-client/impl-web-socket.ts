import { ILogger } from '~/@/logger'
import { p } from '~/@/promise'
import { PubSub, Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { Url } from '~/@/url/url'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { PUB, SUB, SUB_ALL, ToClientMsg, ToServerMsg, UNSUB, UNSUB_ALL } from '../web-socket-msgs'
import { Socket } from '../socket'
import { toWebSocketUrl } from '../to-websocket-url'
import { TopicContractBase } from '../topic-contract'
import { ITopicMsgCodec } from '../topic-msg-codec'
import { TopicNameSubscription } from '../topic-name-subscription'
import { TopicName, TopicString } from '../topic-string'
import { TopicSubscription } from '../topic-subscription'
import { TopicClientNode, ITopicClient } from './interface'

export type ImplWebSockets<T extends TopicContractBase> = {
  t: 'web-sockets'
  contract: T
  serverUrl: Url
  endpoint: string
  clientSessionId: ClientSessionId
  logger: ILogger
  reconnectionRate: TimeSpan
  syncSubscriptionRate: TimeSpan
  codec: ITopicMsgCodec
}

const init = <TContract extends TopicContractBase>(config: ImplWebSockets<TContract>): ITopicClient<TContract> => {
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

const initClientCore = <TContract extends TopicContractBase>(config: ImplWebSockets<TContract>) => {
  const logger = config.logger.child(['topic', 'client'])
  const msgsToServer = Sub.init<ToServerMsg>()
  const subscriptionsByTopic = new Map<TopicString, TopicSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription>()

  const worker = async () => {
    while (true) {
      const abortController = new AbortController()
      try {
        logger.info('connecting to server')

        const socket = Socket.create({ url: toWebSocketUrl(config) })

        await workerSocket(abortController.signal, socket)

        socket.close()
      } catch (e) {
        logger.error('worker error', e)
      } finally {
        logger.info('restarting connection')
        abortController.abort('reconnecting')
        await p.sleep(config.reconnectionRate, abortController.signal)
      }
    }
  }

  const workerSocket = async (s: AbortSignal, socket: Socket) => {
    logger.info('waiting for connection')

    const got = await p.race(s, {
      opened: (s) => Sub.take(socket.msgsOpen, s),
      error: (s) => Sub.take(socket.msgsError, s),
      closed: (s) => Sub.take(socket.msgsClose, s),
    })

    if (got.error) logger.warn('failed to connect. connection errored')
    if (got.closed) logger.warn('connection closed')
    if (got.opened) logger.info('connected')

    if (!got.opened) return

    const closed = await p.race(s, {
      close: (s) => Sub.take(socket.msgsClose, s),
      error: (s) => Sub.take(socket.msgsError, s),
      senderReceiver: (s) => {
        workerSenderReceiver(s, socket)
        return p.neverResolve
      },
    })

    if (closed.close) logger.warn('connection closed')
    if (closed.error) logger.warn('connection error')
    if (closed.senderReceiver) logger.warn('sender/receiver error')

    logger.info('restarting connection')
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
          subscription?.pubSub.pub(fromServerParsed[3])
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

export const ImplWebSockets = {
  init,
}
