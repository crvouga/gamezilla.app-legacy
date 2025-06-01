import { runSaga } from 'redux-saga'
import { delay, fork, race, take, takeEvery } from 'typed-redux-saga'
import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { PubSub, Sub } from '~/@/sub'
import { throttleByKey } from '~/@/throttle/throttle'
import { TimeSpan } from '~/@/time/time-span'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { Client, ContractBase, MsgMeta, Topic } from '../types'
import {
  MSG_TYPE_PUB,
  MSG_TYPE_PUBED,
  MSG_TYPE_SUB,
  MSG_TYPE_SUBBED,
  MSG_TYPE_UNSUB,
  MSG_TYPE_UNSUBBED,
  ToClientMsg,
  ToServerMsg,
  toTopicString,
} from './shared'
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

      yield* delay(1000)

      const socket = createSocket(webSocketUrl)

      const raced = yield* race({
        open: take(Sub.chan(socket.msgsOpen)),
        error: take(Sub.chan(socket.msgsError)),
        close: take(Sub.chan(socket.msgsClose)),
      })

      if (!raced.open) {
        config.logger.warn('[web-socket-client] Failed to connect or connection closed/errored early.', {
          webSocketUrl,
          raced,
        })
        socket.close()
        continue
      }

      config.logger.info('[web-socket-client] Connected.', { webSocketUrl })

      for (const activeSubscription of activeSubscriptions.values()) {
        msgsToServer.pub([MSG_TYPE_SUB, activeSubscription.topicName, activeSubscription.topicParams])
      }

      yield* race({
        close: take(Sub.chan(socket.msgsClose)),
        error: take(Sub.chan(socket.msgsError)),
        toServer: fork(sagaToServer, socket),
        fromServer: fork(sagaFromServer, socket),
      })

      config.logger.info('[web-socket-client] Disconnected or connection error.', { webSocketUrl })
      socket.close()

      activeSubscriptionsServer.clear()
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
      switch (fromServer[0]) {
        case MSG_TYPE_SUBBED: {
          const topicString = toTopicString(fromServer[1], fromServer[2])
          activeSubscriptionsServer.add(topicString)
          return
        }
        case MSG_TYPE_UNSUBBED: {
          const topicString = toTopicString(fromServer[1], fromServer[2])
          activeSubscriptionsServer.delete(topicString)
          return
        }
        case MSG_TYPE_PUBED: {
          const topicString = toTopicString(fromServer[1], fromServer[2])
          const activeSubscription = activeSubscriptions.get(topicString)
          if (!activeSubscription) {
            config.logger.warn(`[web-socket-client] Received PUBED for unknown topicString: ${topicString}. Ignoring.`)
            return
          }
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
          msgsToServer.pub([MSG_TYPE_SUB, topicName, topicParams])
          return
        }
        case 'unsubscribe': {
          if (!activeSubscriptionsServer.has(topicString) && activeSubscriptions.has(topicString)) {
          }
          if (!activeSubscriptions.has(topicString)) {
            return
          }
          msgsToServer.pub([MSG_TYPE_UNSUB, topicName, topicParams])
          return
        }
      }
    },
  })

  function manageSubscriptionLifecycle<TRawMsg, TMappedMsg>(
    corePubSub: PubSub<TRawMsg>,
    mapper: (msg: TRawMsg) => TMappedMsg,
    onUnsubscribeLogic: () => void,
  ): Sub<TMappedMsg> {
    const mappedSourceSub: Sub<TMappedMsg> = Sub.map(corePubSub, mapper)

    return {
      sub: (subscriber: (msg: TMappedMsg) => void): (() => void) => {
        const originalUnsubscribeFn = mappedSourceSub.sub(subscriber)

        return () => {
          originalUnsubscribeFn()
          onUnsubscribeLogic()
        }
      },
    }
  }

  const clientProxy = {} as Client<T>

  for (const topicFullNameStr of Object.keys(config.contract)) {
    const topicKey = topicFullNameStr as keyof T
    const topicDef = config.contract[topicKey] as T[typeof topicKey]

    const topicNameParts = topicFullNameStr.split('/')

    clientProxy[topicKey] = {
      publish: (topicParams: s.Infer<typeof topicDef.params>, msg: s.Infer<typeof topicDef.msg>) => {
        msgsToServer.pub([MSG_TYPE_PUB, topicNameParts, topicParams, JSON.stringify(msg)])
      },
      subscribe: <TMsgOut>(
        topicParams: s.Infer<typeof topicDef.params>,
        mapper: (msgWithMeta: s.Infer<typeof topicDef.msg> & MsgMeta) => TMsgOut,
      ): Sub<TMsgOut> => {
        const topicString = toTopicString(topicNameParts, topicParams)

        syncSubscriptionsWithServer('subscribe', topicString, topicNameParts, topicParams)

        let corePubSub: PubSub<s.Infer<typeof topicDef.msg> & MsgMeta>
        const existingActiveSub = activeSubscriptions.get(topicString)

        if (existingActiveSub) {
          corePubSub = existingActiveSub.pubSub as PubSub<s.Infer<typeof topicDef.msg> & MsgMeta>
        } else {
          corePubSub = Sub.create<s.Infer<typeof topicDef.msg> & MsgMeta>()
          const newActiveSub: ActiveSubscription = {
            pubSub: corePubSub,
            topicString,
            topicName: topicNameParts,
            topicParams: topicParams,
          }
          activeSubscriptions.set(topicString, newActiveSub)
        }

        return manageSubscriptionLifecycle(corePubSub, mapper, () => {
          syncSubscriptionsWithServer('unsubscribe', topicString, topicNameParts, topicParams)
        })
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
    if (webSocket.readyState === WebSocket.OPEN || webSocket.readyState === WebSocket.CONNECTING) {
      webSocket.close()
    }

    webSocket.onopen = null
    webSocket.onclose = null
    webSocket.onerror = null
    webSocket.onmessage = null
  }
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
