import { runSaga } from 'redux-saga'
import { call, delay, fork, race, take, takeEvery } from 'typed-redux-saga'
import { ILogger } from '~/@/logger'
import { PubSub, Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { Client, ClientNode, ContractBase } from '../types'
import { PUB, SUB, SUB_ALL, ToClientMsg, ToServerMsg, UNSUB, UNSUB_ALL } from './msgs'
import { Socket } from './socket'
import { toWebSocketUrl } from './to-websocket-url'
import { Topic, TopicName, toTopic } from './topic'
import { TopicNameSubscription } from './topic-name-subscription'
import { TopicSubscription } from './topic-subscription'

export type Config<T extends ContractBase> = {
  t: 'web-sockets'
  contract: T
  serverUrl: string
  endpoint: string
  clientSessionId: ClientSessionId
  logger: ILogger
  //
  reconnectionRate: TimeSpan
  syncSubscriptionRate: TimeSpan
}

export const initClient = <TContract extends ContractBase>(config: Config<TContract>): Client<TContract> => {
  const clientCore = initClientCore(config)

  const client = Object.entries(config.contract)
    .map(([topicName_, _topic]) => {
      const topicName = topicName_ as TopicName

      const clientNode: ClientNode<TContract, typeof topicName> = {
        pub(topicParams, msg) {
          const topic = toTopic(topicName, topicParams)

          clientCore.msgsToServer.pub([PUB, topicName, topicParams, msg])

          const subscription = clientCore.subscriptionsByTopic.get(topic)

          if (!subscription) return

          subscription.pubSub.pub(msg)
        },
        sub(topicParams, mapper) {
          const topic = toTopic(topicName, topicParams)

          const subscription = clientCore.subscriptionsByTopic.get(topic)

          if (subscription) return subscription.pubSub

          const pubSub = Sub.create<any>()

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

          const pubSub = Sub.create<any>()

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
    }, {} as Client<TContract>)

  return client
}

const initClientCore = <TContract extends ContractBase>(config: Config<TContract>) => {
  const msgsToServer = Sub.create<ToServerMsg>()
  const subscriptionsByTopic = new Map<Topic, TopicSubscription>()
  const subscriptionsByTopicName = new Map<TopicName, TopicNameSubscription>()

  runSaga({}, flowMain)

  function* flowMain() {
    while (true) {
      config.logger.info('connecting to server')

      const socket = Socket.create({ url: toWebSocketUrl(config) })

      yield* call(flowSocket, socket)

      socket.close()

      yield* delay(TimeSpan.toMilliseconds(config.reconnectionRate))
    }
  }

  function* flowSocket(socket: Socket) {
    config.logger.info('waiting for connection')

    const opened = yield* race({
      open: take(Sub.chan(socket.msgsOpen)),
      error: take(Sub.chan(socket.msgsError)),
      close: take(Sub.chan(socket.msgsClose)),
    })

    if (opened.error) config.logger.warn('failed to connect. connection errored')
    if (opened.close) config.logger.warn('connection closed')
    if (opened.open) config.logger.info('connected')

    if (!opened.open) return

    const closed = yield* race({
      close: take(Sub.chan(socket.msgsClose)),
      error: take(Sub.chan(socket.msgsError)),
      sender: call(flowSender, socket),
      reciever: call(flowReciever, socket),
    })

    if (closed.close) config.logger.warn('connection closed')
    if (closed.error) config.logger.warn('connection error')

    config.logger.info('restarting connection')
  }

  function* flowSender(socket: Socket) {
    const send = (msg: ToServerMsg) => {
      socket.send(JSON.stringify(msg))
    }
    yield* takeEvery(Sub.chan(msgsToServer), function* (toServer) {
      switch (toServer[0]) {
        case PUB: {
          send(toServer)
          return
        }
      }
    })
    yield* fork(flowSyncSubscriptionsTopic, send)
    yield* fork(flowSyncSubscriptionsTopicName, send)
  }

  function* flowSyncSubscriptionsTopic(send: (msg: ToServerMsg) => void) {
    const subscribedTopicsServer = new Set<string>()
    while (true) {
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

      yield* delay(TimeSpan.toMilliseconds(config.syncSubscriptionRate))
    }
  }

  function* flowSyncSubscriptionsTopicName(send: (msg: ToServerMsg) => void) {
    const subscribedTopicsServer = new Set<string>()
    while (true) {
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

      yield* delay(TimeSpan.toMilliseconds(config.syncSubscriptionRate))
    }
  }

  function* flowReciever(socket: Socket) {
    yield takeEvery(Sub.chan(socket.msgsFromServer), function* (fromServer) {
      const fromServerParsed = JSON.parse(fromServer) as ToClientMsg

      switch (fromServerParsed[0]) {
        case PUB: {
          const topic = toTopic(fromServerParsed[1], fromServerParsed[2])
          const activeSubscription = subscriptionsByTopic.get(topic)
          if (!activeSubscription) return
          activeSubscription.pubSub.pub(fromServerParsed[3])
          return
        }
      }
    })
  }

  return {
    subscriptionsByTopic,
    subscriptionsByTopicName,
    msgsToServer,
  }
}
