import { delay, race, take, takeEvery } from 'typed-redux-saga'
import { ILogger } from '~/@/logger'
import { go } from '~/@/saga/saga'
import { Sub } from '~/@/sub'
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

type TopicSubscriptionInfo = {
  pubSub: Sub<unknown>
  topicName: string[]
  topicParams: unknown
}

export const initClient = <T extends Contract<any>>(config: Config<T>): Client<T> => {
  const msgsToServer = Sub.create<ToServerMsg>()
  const topicSubscriptions = new Map<string, TopicSubscriptionInfo>()
  const topicSubscriptionsServer = new Set<string>()

  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.topicSubscriptionsServer = topicSubscriptionsServer
    // @ts-ignore
    window.topicSubscriptions = topicSubscriptions
  }

  function* saga() {
    while (true) {
      const webSocketUrl = toWebSocketUrl({
        serverUrl: config.serverUrl,
        endpoint: config.endpoint,
        clientSessionId: config.clientSessionId,
      })

      const socket = createSocket(webSocketUrl)

      yield take(Sub.chan(socket.msgsOpen))

      for (const topicSubscription of topicSubscriptions.values()) {
        socket.msgsToServer.pub({
          t: 'subscribe',
          topicName: topicSubscription.topicName,
          topicParams: topicSubscription.topicParams,
        })
      }

      yield* race({
        close: take(Sub.chan(socket.msgsClose)),
        error: take(Sub.chan(socket.msgsError)),
        toServer: sagaToServer(socket),
        fromServer: sagaFromServer(socket),
      })

      topicSubscriptionsServer.clear()

      yield delay(1000)
    }
  }

  function* sagaToServer(socket: Socket) {
    const chan = Sub.chan(msgsToServer)
    yield takeEvery(chan, function* (toServer) {
      console.log('toServer', toServer)
      socket.msgsToServer.pub(toServer)
    })
  }

  function* sagaFromServer(socket: Socket) {
    yield takeEvery(Sub.chan(socket.msgsFromServer), function* (fromServer) {
      const topicString = toTopicString(fromServer.topicName, fromServer.topicParams)
      switch (fromServer.t) {
        case 'subscribed': {
          topicSubscriptionsServer.add(topicString)
          return
        }
        case 'unsubscribed': {
          topicSubscriptionsServer.delete(topicString)
          return
        }
        case 'published': {
          const topicSubscription = topicSubscriptions.get(topicString)
          if (!topicSubscription) return
          const msg = JSON.parse(fromServer.msg)
          topicSubscription.pubSub.pub(msg)
          return
        }
      }
    })
  }

  const syncSubscriptionsWithServer = throttleByKey({
    behavior: 'leading',
    throttle: TimeSpan.seconds(3),
    keyFn: (_action, topicName, topicParams) => toTopicString(topicName, topicParams),
    fn: (action: 'subscribe' | 'unsubscribe', topicName: string[], topicParams: unknown) => {
      const topicString = toTopicString(topicName, topicParams)

      if (action === 'subscribe' && !topicSubscriptionsServer.has(topicString)) {
        msgsToServer.pub({ t: 'subscribe', topicName, topicParams })
      }

      if (action === 'unsubscribe' && topicSubscriptionsServer.has(topicString)) {
        msgsToServer.pub({ t: 'unsubscribe', topicName, topicParams })
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
            msgsToServer.pub({ t: 'publish', topicName, topicParams, msg: JSON.stringify(msg) })
          },
          subscribe: (topicParams: unknown, mapper: (msg: any) => any): Sub<any> => {
            const topicString = toTopicString(topicName, topicParams)
            const existing = topicSubscriptions.get(topicString)

            if (existing) return existing.pubSub

            syncSubscriptionsWithServer('subscribe', topicName, topicParams)

            const sub = Sub.create()
            const pubSub: Sub<any> = {
              ...sub,
              sub(subscriber) {
                const unsub = sub.sub((msg) => subscriber(mapper(msg)))
                return () => {
                  unsub()
                  syncSubscriptionsWithServer('unsubscribe', topicName, topicParams)
                }
              },
            }
            topicSubscriptions.set(topicString, { pubSub, topicName, topicParams })
            return pubSub
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

  go(saga)

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
