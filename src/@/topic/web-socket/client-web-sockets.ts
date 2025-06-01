import { cancel, delay, fork, race, take, takeEvery } from 'typed-redux-saga'
import { ILogger } from '~/@/logger'
import { go } from '~/@/saga/saga'
import { PubSub, Sub } from '~/@/sub'
import { throttleByKey } from '~/@/throttle/throttle'
import { TimeSpan } from '~/@/time/time-span'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { Client, Contract } from '../types'
import { ToClientMsg, ToServerMsg, toTopicString } from './shared'
import { toWebSocketUrl } from './to-websocket-url'

export type Config<T extends Contract<any>> = {
  t: 'web-sockets'
  contract: T
  serverUrl: string
  endpoint: string
  clientSessionId: ClientSessionId
  logger: ILogger
}

type ActiveSubscription = {
  pubSub: PubSub<unknown>
  topicString: string
  topicName: string[]
  topicParams: unknown
}

export const initClient = <T extends Contract<any>>(config: Config<T>): Client<T> => {
  const msgsToServer = Sub.create<ToServerMsg>()
  const activeSubscriptions = new Map<string, ActiveSubscription>()
  const activeSubscriptionsServer = new Set<string>()

  go(saga)

  function* saga() {
    while (true) {
      const webSocketUrl = toWebSocketUrl({
        serverUrl: config.serverUrl,
        endpoint: config.endpoint,
        clientSessionId: config.clientSessionId,
      })

      const socket = createSocket(webSocketUrl)

      yield take(Sub.chan(socket.msgsOpen))

      const toServerTask = yield* fork(sagaToServer, socket)
      const fromServerTask = yield* fork(sagaFromServer, socket)

      yield* race({
        close: take(Sub.chan(socket.msgsClose)),
        error: take(Sub.chan(socket.msgsError)),
      })

      yield cancel(toServerTask)
      yield cancel(fromServerTask)

      yield delay(1000)
    }
  }

  function* sagaToServer(socket: Socket) {
    const chan = Sub.chan(msgsToServer)

    while (true) {
      const toServer = yield* take(chan)
      socket.msgsToServer.pub(toServer)
    }
  }

  function* sagaFromServer(socket: Socket) {
    yield takeEvery(Sub.chan(socket.msgsFromServer), (fromServer) => {
      switch (fromServer.t) {
        case 'subscribed': {
          activeSubscriptionsServer.add(fromServer.topicString)
          return
        }
        case 'unsubscribed': {
          activeSubscriptionsServer.delete(fromServer.topicString)
          return
        }
        case 'published': {
          const activeSubscription = activeSubscriptions.get(fromServer.topicString)
          if (!activeSubscription) return
          const msg = JSON.parse(fromServer.msg)
          activeSubscription.pubSub.pub(msg)
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
          if (activeSubscriptionsServer.has(topicString)) return
          console.log('subscribe', topicString)
          msgsToServer.pub({ t: 'subscribe', topicString, topicName, topicParams })
          return
        }
        case 'unsubscribe': {
          if (!activeSubscriptionsServer.has(topicString)) return
          console.log('unsubscribe', topicString)
          msgsToServer.pub({ t: 'unsubscribe', topicString, topicName, topicParams })
          return
        }
      }
    },
  })

  const createClientRecursive = (currentContract: Contract<any>, runningTopicName: string[] = []): any => {
    const clientProxy: any = {}

    for (const topicNamePart in currentContract) {
      const topicConfig = currentContract[topicNamePart]

      if (!topicConfig) continue

      const topicName: string[] = [...runningTopicName, topicNamePart]

      if ('params' in topicConfig && 'msg' in topicConfig) {
        clientProxy[topicNamePart] = {
          publish: (topicParams: unknown, msg: unknown) => {
            msgsToServer.pub({
              t: 'publish',
              topicString: toTopicString(topicName, topicParams),
              topicName,
              topicParams,
              msg: JSON.stringify(msg),
            })
          },
          subscribe: (topicParams: unknown, mapper: (msg: any) => any): Sub<any> => {
            const topicString = toTopicString(topicName, topicParams)

            const activeSubscription = activeSubscriptions.get(topicString)

            syncSubscriptionsWithServer('subscribe', topicString, topicName, topicParams)

            if (activeSubscription) return activeSubscription.pubSub

            const sub = Sub.create()

            const pubSub: PubSub<any> = {
              ...sub,
              sub(subscriber) {
                const unsub = sub.sub((msg) => subscriber(mapper(msg)))
                return () => {
                  unsub()
                  syncSubscriptionsWithServer('unsubscribe', topicString, topicName, topicParams)
                }
              },
            }

            const activeSubscriptionNew: ActiveSubscription = {
              pubSub,
              topicString,
              topicName,
              topicParams,
            }

            activeSubscriptions.set(topicString, activeSubscriptionNew)

            return activeSubscriptionNew.pubSub
          },
        }
      } else {
        clientProxy[topicNamePart] = createClientRecursive(topicConfig as Contract<any>, [
          ...runningTopicName,
          topicNamePart,
        ])
      }
    }
    return clientProxy
  }

  return createClientRecursive(config.contract) as Client<T>
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

  msgsToServer.sub((msg) => {
    webSocket.send(JSON.stringify(msg))
  })

  return {
    msgsOpen,
    msgsClose,
    msgsError,
    msgsToServer,
    msgsFromServer,
  }
}

type Socket = ReturnType<typeof createSocket>
