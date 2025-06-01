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

type ActiveSubscription = {
  pubSub: PubSub<any>
  topicString: string
  topicName: string
  topicParams: unknown
}

export const initClient = <T extends Record<string, Topic<any, any>>>(config: Config<T>): Client<T> => {
  const msgsToServer = Sub.create<ToServerMsg>()

  const activeSubscriptions = new Map<string, ActiveSubscription>()
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

      for (const activeSubscription of activeSubscriptions.values()) {
        msgsToServer.pub(['sub', activeSubscription.topicName, activeSubscription.topicParams])
        config.logger.info('subscribed to topic', activeSubscription.topicName)
      }

      const closed = yield* race({
        close: take(Sub.chan(socket.msgsClose)),
        error: take(Sub.chan(socket.msgsError)),
        toServer: call(sagaToServer, socket),
        fromServer: call(sagaFromServer, socket),
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

  function* sagaToServer(socket: Socket<ToServerMsg, ToClientMsg>) {
    yield takeEvery(Sub.chan(msgsToServer), function* (toServer) {
      config.logger.info('sending message to server', toServer)

      switch (toServer[0]) {
        case 'sub': {
          const topicString = toTopicString(toServer[1], toServer[2])
          if (activeSubscriptionsServer.has(topicString)) return
          socket.send(toServer)
          return
        }
        case 'unsub': {
          const topicString = toTopicString(toServer[1], toServer[2])
          if (!activeSubscriptionsServer.has(topicString)) return
          socket.send(toServer)
          return
        }
        case 'pub': {
          socket.send(toServer)
          return
        }
      }
    })
  }

  function* sagaFromServer(socket: Socket<ToServerMsg, ToClientMsg>) {
    yield takeEvery(Sub.chan(socket.msgsFromServer), function* (fromServer) {
      switch (fromServer[0]) {
        case 'sub': {
          const topicString = toTopicString(fromServer[1], fromServer[2])
          activeSubscriptionsServer.add(topicString)
          return
        }
        case 'unsub': {
          const topicString = toTopicString(fromServer[1], fromServer[2])
          activeSubscriptionsServer.delete(topicString)
          return
        }
        case 'pub': {
          const topicString = toTopicString(fromServer[1], fromServer[2])
          const activeSubscription = activeSubscriptions.get(topicString)
          if (!activeSubscription) return
          const msgPayload = JSON.parse(fromServer[3] as string)
          const combinedMsg = { ...(msgPayload as any) }
          activeSubscription.pubSub.pub(combinedMsg)
          return
        }
      }
    })
  }

  const syncSubscription = throttleByKey({
    behavior: 'leading',
    fn: (type: 'sub' | 'unsub', topicName: string, topicParams: unknown) => {
      msgsToServer.pub([type, topicName, topicParams])
    },
    keyFn: (type, topicName, topicParams) => {
      return `${type}${toTopicString(topicName, topicParams)}`
    },
    throttle: TimeSpan.seconds(3),
  })

  return Object.entries(config.contract)
    .map(([topicName, topic]) => {
      return [
        topicName,
        {
          publish: (topicParams: s.Infer<typeof topic.params>, msg: s.Infer<typeof topic.msg>) => {
            msgsToServer.pub(['pub', topicName, topicParams, JSON.stringify(msg)])
          },
          subscribe: <TMsgOut>(
            topicParams: s.Infer<typeof topic.params>,
            mapper: (msgWithMeta: s.Infer<typeof topic.msg> & MsgMeta) => TMsgOut,
          ): Sub<TMsgOut> => {
            const topicString = toTopicString(topicName, topicParams)

            syncSubscription('sub', topicName, topicParams)

            const existingActiveSub = activeSubscriptions.get(topicString)

            if (existingActiveSub) return existingActiveSub.pubSub

            const pubSub = Sub.create<s.Infer<typeof topic.msg> & MsgMeta>()

            const pubSubMapped: PubSub<TMsgOut> = {
              ...pubSub,
              sub: (subscriber) => {
                const unsub = pubSub.sub((msg) => subscriber(mapper(msg)))
                return () => {
                  syncSubscription('unsub', topicName, topicParams)
                  unsub()
                }
              },
            }

            activeSubscriptions.set(topicString, {
              pubSub: pubSubMapped,
              topicString,
              topicName,
              topicParams,
            })

            return pubSubMapped
          },
        },
      ] as const
    })
    .reduce((acc, [topicName, topic]) => {
      acc[topicName as keyof T] = topic
      return acc
    }, {} as Client<T>)
}
