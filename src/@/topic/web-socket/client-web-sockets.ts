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
      const socketUrl = toWebSocketUrl(config)
      const socket = createSocket(socketUrl)

      const opened = yield* race({
        open: take(Sub.chan(socket.msgsOpen)),
        error: take(Sub.chan(socket.msgsError)),
        close: take(Sub.chan(socket.msgsClose)),
      })

      if (opened.error) {
        config.logger.warn('failed to connect. connection errored')
        yield* restart(socket)
        continue
      }

      if (opened.close) {
        config.logger.warn('connection closed')
        yield* restart(socket)
        continue
      }

      config.logger.info('connected')

      for (const activeSubscription of activeSubscriptions.values()) {
        msgsToServer.pub(['sub', activeSubscription.topicName, activeSubscription.topicParams])
      }

      const closed = yield* race({
        close: take(Sub.chan(socket.msgsClose)),
        error: take(Sub.chan(socket.msgsError)),
        toServer: call(sagaToServer, socket),
        fromServer: call(sagaFromServer, socket),
      })

      if (closed.close) {
        config.logger.warn('disconnected or connection error')
        yield* restart(socket)
        continue
      }

      if (closed.error) {
        config.logger.warn('disconnected or connection error')
        yield* restart(socket)
        continue
      }
    }
  }

  function* restart(socket: Socket) {
    activeSubscriptionsServer.clear()

    socket.cmds.pub({ t: 'close' })

    yield* delay(1000)
  }

  function* sagaToServer(socket: Socket) {
    yield takeEvery(Sub.chan(msgsToServer), function* (toServer) {
      switch (toServer[0]) {
        case 'sub': {
          const topicString = toTopicString(toServer[1], toServer[2])
          if (activeSubscriptionsServer.has(topicString)) return
          socket.msgsToServer.pub(toServer)
          return
        }
        case 'unsub': {
          const topicString = toTopicString(toServer[1], toServer[2])
          if (!activeSubscriptionsServer.has(topicString)) return
          socket.msgsToServer.pub(toServer)
          return
        }
        case 'pub': {
          socket.msgsToServer.pub(toServer)
          return
        }
      }
    })
  }

  function* sagaFromServer(socket: Socket) {
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

  const syncSubscriptionsWithServer = throttleByKey({
    behavior: 'leading',
    throttle: TimeSpan.seconds(3),
    keyFn: (_action, topicString, _topicName, _topicParams) => topicString,
    fn: (action: 'subscribe' | 'unsubscribe', _topicString: string, topicName: string[], topicParams: unknown) => {
      switch (action) {
        case 'subscribe': {
          msgsToServer.pub(['sub', topicName, topicParams])
          return
        }
        case 'unsubscribe': {
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
            const unsub = pubSub.sub((msg) => subscriber(mapper(msg)))
            return () => {
              unsub()
              syncSubscriptionsWithServer('unsubscribe', topicString, topicNameParts, topicParams)
            }
          },
        }

        activeSubscriptions.set(topicString, {
          pubSub: pubSubMapped,
          topicString,
          topicName: topicNameParts,
          topicParams: topicParams,
        })

        return pubSubMapped
      },
    }
  }

  return clientProxy
}

const createSocket = (url: string) => {
  const msgsOpen = Sub.create<{ t: 'opened' }>()
  const msgsClose = Sub.create<{ t: 'closed' }>()
  const msgsError = Sub.create<{ t: 'error'; error: Event }>()
  const msgsToServer = Sub.create<ToServerMsg>()
  const msgsFromServer = Sub.create<ToClientMsg>()
  const cmds = Sub.create<{ t: 'close' }>()
  const ws = new WebSocket(url)

  ws.onopen = () => {
    msgsOpen.pub({ t: 'opened' })
  }

  ws.onclose = () => {
    msgsClose.pub({ t: 'closed' })
  }

  ws.onerror = (error) => {
    msgsError.pub({ t: 'error', error })
  }

  ws.onmessage = (event) => {
    const toClientMsg: ToClientMsg = JSON.parse(event.data as string) as ToClientMsg
    msgsFromServer.pub(toClientMsg)
  }

  cmds.sub((cmd) => {
    switch (cmd.t) {
      case 'close': {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }

        if (ws.readyState === WebSocket.CONNECTING) {
          setTimeout(() => cmds.pub({ t: 'close' }), 1000)
          return
        }

        ws.onopen = null
        ws.onclose = null
        ws.onerror = null
        ws.onmessage = null
        return
      }
    }
  })

  msgsToServer.sub((toServer) => {
    ws.send(JSON.stringify(toServer))
  })

  return {
    msgsOpen,
    msgsClose,
    msgsError,
    msgsToServer,
    msgsFromServer,
    cmds,
  }
}

type Socket = ReturnType<typeof createSocket>
