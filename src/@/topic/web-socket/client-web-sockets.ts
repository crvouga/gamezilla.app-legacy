import { runSaga } from 'redux-saga'
import { delay, fork, race, take, takeEvery } from 'typed-redux-saga'
import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { PubSub, Sub } from '~/@/sub'
import { throttleByKey } from '~/@/throttle/throttle'
import { TimeSpan } from '~/@/time/time-span'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { Client, ContractBase, MsgMeta, Topic } from '../types'
import { ToClientMsg, ToServerMsg, toTopicString } from './shared'
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
  topicName: string[]
  topicParams: unknown
}

export const initClient = <T extends Record<string, Topic<any, any>>>(config: Config<T>): Client<T> => {
  const msgsToServer = Sub.create<ToServerMsg>()
  const activeSubscriptions = new Map<string, ActiveSubscription>()
  const activeSubscriptionsServer = new Set<string>()

  runSaga({}, saga)

  function* saga() {
    while (true) {
      const webSocketUrl = toWebSocketUrl({
        serverUrl: config.serverUrl,
        endpoint: config.endpoint,
        clientSessionId: config.clientSessionId,
      })

      const socket = createSocket(webSocketUrl)

      const raced = yield* race({
        open: take(Sub.chan(socket.msgsOpen)),
        error: take(Sub.chan(socket.msgsError)),
        close: take(Sub.chan(socket.msgsClose)),
      })

      if (!raced.open) {
        config.logger.warn('Failed to connect or connection closed/errored early.', {
          webSocketUrl,
          raced,
        })
        socket.close()
        yield* delay(1000)
        continue
      }

      config.logger.info('Connected.', { webSocketUrl })

      for (const activeSubscription of activeSubscriptions.values()) {
        msgsToServer.pub(['sub', activeSubscription.topicName, activeSubscription.topicParams])
      }

      yield* race({
        close: take(Sub.chan(socket.msgsClose)),
        error: take(Sub.chan(socket.msgsError)),
        toServer: fork(sagaToServer, socket),
        fromServer: fork(sagaFromServer, socket),
      })

      config.logger.info('Disconnected or connection error.', { webSocketUrl })
      socket.close()
      activeSubscriptionsServer.clear()
      yield* delay(1000)
    }
  }

  function* sagaToServer(socket: Socket) {
    const chan = Sub.chan(msgsToServer)
    yield takeEvery(chan, function* (toServer) {
      socket.msgsToServer.pub(toServer)
    })
  }

  function* sagaFromServer(socket: Socket) {
    const chan = Sub.chan(socket.msgsFromServer)
    yield takeEvery(chan, function* (fromServer) {
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

  const syncSubscriptionsWithServer = throttleByKey({
    behavior: 'leading',
    throttle: TimeSpan.seconds(3),
    keyFn: (_action, topicString, _topicName, _topicParams) => topicString,
    fn: (action: 'subscribe' | 'unsubscribe', topicString: string, topicName: string[], topicParams: unknown) => {
      switch (action) {
        case 'subscribe': {
          msgsToServer.pub(['sub', topicName, topicParams])
          return
        }
        case 'unsubscribe': {
          if (!activeSubscriptionsServer.has(topicString) && activeSubscriptions.has(topicString)) {
          }
          if (!activeSubscriptions.has(topicString)) {
            return
          }
          msgsToServer.pub(['unsub', topicName, topicParams])
          return
        }
      }
    },
  })

  const clientProxy = {} as Client<T>

  for (const topicFullNameStr of Object.keys(config.contract)) {
    const topicKey = topicFullNameStr as keyof T
    const topicDef = config.contract[topicKey] as T[typeof topicKey]

    const topicNameParts = topicFullNameStr.split('/')

    clientProxy[topicKey] = {
      publish: (topicParams: s.Infer<typeof topicDef.params>, msg: s.Infer<typeof topicDef.msg>) => {
        msgsToServer.pub(['pub', topicNameParts, topicParams, JSON.stringify(msg)])
      },
      subscribe: <TMsgOut>(
        topicParams: s.Infer<typeof topicDef.params>,
        mapper: (msgWithMeta: s.Infer<typeof topicDef.msg> & MsgMeta) => TMsgOut,
      ): Sub<TMsgOut> => {
        const topicString = toTopicString(topicNameParts, topicParams)

        syncSubscriptionsWithServer('subscribe', topicString, topicNameParts, topicParams)

        const existingActiveSub = activeSubscriptions.get(topicString)

        if (existingActiveSub) return existingActiveSub.pubSub

        const pubSub = Sub.create<s.Infer<typeof topicDef.msg> & MsgMeta>()
        const pubSubMapped: PubSub<TMsgOut> = {
          ...pubSub,
          sub: (subscriber) => {
            const unsub = pubSub.sub((msg) => {
              subscriber(mapper(msg))
            })
            return () => {
              unsub()
              syncSubscriptionsWithServer('unsubscribe', topicString, topicNameParts, topicParams)
            }
          },
        }
        const newActiveSub: ActiveSubscription = {
          pubSub: pubSubMapped,
          topicString,
          topicName: topicNameParts,
          topicParams: topicParams,
        }

        activeSubscriptions.set(topicString, newActiveSub)

        return pubSubMapped
      },
    }
  }

  return clientProxy
}

const createSocket = (url: string) => {
  const webSocket = new WebSocket(url)
  const msgsOpen = Sub.create<{ t: 'opened' }>()
  const msgsClose = Sub.create<{ t: 'closed' }>()
  const msgsError = Sub.create<{ t: 'error'; error: Event }>()
  const msgsToServer = Sub.create<ToServerMsg>()
  const msgsFromServer = Sub.create<ToClientMsg>()

  webSocket.onopen = () => {
    msgsOpen.pub({ t: 'opened' })
  }

  webSocket.onclose = () => {
    msgsClose.pub({ t: 'closed' })
  }

  webSocket.onerror = (error) => {
    msgsError.pub({ t: 'error', error })
  }

  webSocket.onmessage = (event) => {
    const toClientMsg: ToClientMsg = JSON.parse(event.data as string) as ToClientMsg
    msgsFromServer.pub(toClientMsg)
  }

  const close = () => {
    webSocket.close()
    webSocket.onopen = null
    webSocket.onclose = null
    webSocket.onerror = null
    webSocket.onmessage = null
  }

  msgsToServer.sub((toServer) => {
    webSocket.send(JSON.stringify(toServer))
  })

  return {
    msgsOpen,
    msgsClose,
    msgsError,
    msgsToServer,
    msgsFromServer,
    close,
  }
}

type Socket = ReturnType<typeof createSocket>
