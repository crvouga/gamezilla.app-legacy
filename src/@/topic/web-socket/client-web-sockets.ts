import { runSaga } from 'redux-saga'
import { call, delay, race, take, takeEvery } from 'typed-redux-saga'
import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { PubSub, Sub } from '~/@/sub'
import { throttleByKey } from '~/@/throttle/throttle'
import { TimeSpan } from '~/@/time/time-span'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { Client, ContractBase, MsgMeta, Topic } from '../types'
import { ToClientMsg, ToServerMsg, toTopicString } from './shared'
import { Socket } from './socket'
import { toWebSocketUrl } from './to-websocket-url'

export type Config<T extends ContractBase> = {
  t: 'web-sockets'
  contract: T
  serverUrl: string
  endpoint: string
  clientSessionId: ClientSessionId
  logger: ILogger
}

export const initClient = <T extends Record<string, Topic<any, any>>>(config: Config<T>): Client<T> => {
  const clientCore = initClientCore(config)

  const client = Object.entries(config.contract)
    .map(([topicName, topic]) => {
      return [
        topicName,
        {
          publish: (topicParams: s.Infer<typeof topic.params>, msg: s.Infer<typeof topic.msg>) => {
            const topicString = toTopicString(topicName, topicParams)
            clientCore.msgsToServer.pub(['pub', topicString, JSON.stringify(msg)])
          },
          subscribe: <TMsgOut>(
            topicParams: s.Infer<typeof topic.params>,
            mapper: (msgWithMeta: s.Infer<typeof topic.msg> & MsgMeta) => TMsgOut,
          ): Sub<TMsgOut> => {
            const topicString = toTopicString(topicName, topicParams)

            clientCore.msgsToServer.pub(['sub', topicString])

            const existing = clientCore.activeSubscriptions.get(topicString)

            if (existing) return existing

            const pubSub = Sub.create<s.Infer<typeof topic.msg> & MsgMeta>()

            const pubSubMapped: PubSub<TMsgOut> = {
              ...pubSub,
              sub: (subscriber) => {
                const unsub = pubSub.sub((msg) => subscriber(mapper(msg)))
                return () => {
                  clientCore.msgsToServer.pub(['unsub', topicString])
                  unsub()
                }
              },
            }

            clientCore.activeSubscriptions.set(topicString, pubSubMapped)

            return pubSubMapped
          },
        },
      ] as const
    })
    .reduce((acc, [topicName, topic]) => {
      acc[topicName as keyof T] = topic
      return acc
    }, {} as Client<T>)

  return client
}

const initClientCore = <T extends Record<string, Topic<any, any>>>(config: Config<T>) => {
  const msgsToServer = Sub.create<ToServerMsg>()
  const activeSubscriptions = new Map<string, PubSub<any>>()
  const activeSubscriptionsServer = new Set<string>()

  runSaga({}, saga)

  function* saga() {
    while (true) {
      config.logger.info('connecting to server')

      const socket = Socket.create<ToServerMsg, ToClientMsg>({
        url: toWebSocketUrl(config),
        ToClientMsg: ToClientMsg,
        ToServerMsg: ToServerMsg,
      })

      config.logger.info('waiting for connection')

      const opened = yield* race({
        open: take(Sub.chan(socket.msgsOpen)),
        error: take(Sub.chan(socket.msgsError)),
        close: take(Sub.chan(socket.msgsClose)),
      })

      if (opened.error) config.logger.warn('failed to connect. connection errored')
      if (opened.close) config.logger.warn('connection closed')
      if (opened.open) config.logger.info('connected')

      if (!opened.open) {
        yield* restart(socket)
        continue
      }

      for (const topicString of activeSubscriptions.keys()) {
        msgsToServer.pub(['sub', topicString])
        config.logger.info('subscribed to topic', topicString)
      }

      const closed = yield* race({
        close: take(Sub.chan(socket.msgsClose)),
        error: take(Sub.chan(socket.msgsError)),
        toServer: call(flowMsgToServer, socket),
        fromServer: call(flowMsgFromServer, socket),
      })

      if (closed.close) config.logger.warn('connection closed')
      if (closed.error) config.logger.warn('connection error')

      yield* restart(socket)
    }
  }

  function* restart(socket: Socket<ToServerMsg, ToClientMsg>) {
    config.logger.info('restarting connection')

    activeSubscriptionsServer.clear()

    socket.close()

    yield* delay(1000)
  }

  function* flowMsgToServer(socket: Socket<ToServerMsg, ToClientMsg>) {
    const syncSubscription = throttleByKey({
      behavior: 'leading',
      keyFn: (_type, topicString) => topicString,
      throttle: TimeSpan.seconds(3),
      fn: (type: 'sub' | 'unsub', topicString: string) => socket.send([type, topicString]),
    })

    yield takeEvery(Sub.chan(msgsToServer), function* (toServer) {
      config.logger.info('sending message to server', toServer)

      switch (toServer[0]) {
        case 'sub': {
          if (activeSubscriptionsServer.has(toServer[1])) return
          syncSubscription('sub', toServer[1])
          return
        }
        case 'unsub': {
          if (!activeSubscriptionsServer.has(toServer[1])) return
          syncSubscription('unsub', toServer[1])
          return
        }
        case 'pub': {
          socket.send(toServer)
          return
        }
      }
    })
  }

  function* flowMsgFromServer(socket: Socket<ToServerMsg, ToClientMsg>) {
    yield takeEvery(Sub.chan(socket.msgsFromServer), function* (fromServer) {
      switch (fromServer[0]) {
        case 'sub': {
          activeSubscriptionsServer.add(fromServer[1])
          return
        }
        case 'unsub': {
          activeSubscriptionsServer.delete(fromServer[1])
          return
        }
        case 'pub': {
          const activeSubscription = activeSubscriptions.get(fromServer[1])
          if (!activeSubscription) return
          activeSubscription.pub(fromServer[2])
          return
        }
      }
    })
  }

  return {
    msgsToServer,
    activeSubscriptions,
  }
}
