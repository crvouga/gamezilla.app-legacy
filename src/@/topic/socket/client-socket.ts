import { runSaga } from 'redux-saga'
import { call, delay, fork, race, take, takeEvery } from 'typed-redux-saga'
import { ILogger } from '~/@/logger'
import { PubSub, Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { Client, ClientNode, ContractBase, Topic } from '../types'
import { PUB, SUB, ToClientMsg, ToServerMsg, toTopic, UNSUB } from './shared'
import { Socket } from './socket'
import { toWebSocketUrl } from './to-websocket-url'

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

export const initClient = <T extends Record<string, Topic<any, any>>>(config: Config<T>): Client<T> => {
  const clientCore = initClientCore(config)

  const client = Object.entries(config.contract)
    .map(([topicName, _topic]) => {
      const clientNode: ClientNode<T, typeof topicName> = {
        pub(topicParams, msg) {
          const topic = toTopic(topicName, topicParams)

          clientCore.msgsToServer.pub([PUB, topic, msg])

          const existing = clientCore.subscriptions.get(topic)

          if (!existing) return

          existing.pub(msg)
        },
        sub(topicParams, mapper) {
          const topic = toTopic(topicName, topicParams)

          const existing = clientCore.subscriptions.get(topic)

          if (existing) return existing

          const pubSub = Sub.create<any>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (s) => pubSub.sub((m) => s(mapper(m))),
          }

          clientCore.subscriptions.set(topic, pubSubMapped)

          return pubSubMapped
        },
      }
      return [topicName, clientNode] as const
    })
    .reduce((acc, [topicName, topic]) => {
      acc[topicName as keyof T] = topic
      return acc
    }, {} as Client<T>)

  return client
}

const initClientCore = <T extends Record<string, Topic<any, any>>>(config: Config<T>) => {
  const msgsToServer = Sub.create<ToServerMsg>()
  const subscriptionsByTopic = new Map<string, PubSub<any>>()

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
    yield* fork(flowSyncSubscriptions, send)
  }

  function* flowSyncSubscriptions(send: (msg: ToServerMsg) => void) {
    const subscriptionsServer = new Set<string>()
    while (true) {
      for (const [topic, pubSub] of subscriptionsByTopic.entries()) {
        const isSubbedServer = subscriptionsServer.has(topic)
        const isSubbedClient = pubSub.subscriberCount() > 0

        if (isSubbedClient && !isSubbedServer) {
          send([SUB, topic])
          subscriptionsServer.add(topic)
          continue
        }

        if (!isSubbedClient && isSubbedServer) {
          send([UNSUB, topic])
          subscriptionsServer.delete(topic)
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
          const activeSubscription = subscriptionsByTopic.get(fromServerParsed[1])
          if (!activeSubscription) return
          activeSubscription.pub(fromServerParsed[2])
          return
        }
      }
    })
  }

  return {
    subscriptions: subscriptionsByTopic,
    msgsToServer,
  }
}
