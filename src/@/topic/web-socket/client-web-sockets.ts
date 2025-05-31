import { ILogger, Logger } from '~/@/logger'
import { isErr } from '~/@/result'
import { PubSub, Sub } from '~/@/sub'
import { throttleByKey } from '~/@/throttle/throttle'
import { TimeSpan } from '~/@/time/time-span'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { Client, Contract } from '../types'
import { ToClientMsg, ToServerMsg, toTopicString } from './shared'
import { toWebsocketUrl } from './to-websocket-url'

export type Config<T extends Contract<any>> = {
  t: 'web-sockets'
  contract: T
  serverUrl: string
  endpoint: string
  clientSessionId: ClientSessionId
  logger: ILogger
}

export const initClient = <T extends Contract<any>>(config: Config<T>): Client<T> => {
  const logger = Logger.prefix('client', config.logger)

  const websocketUrl = toWebsocketUrl({
    serverUrl: config.serverUrl,
    endpoint: config.endpoint,
    clientSessionId: config.clientSessionId,
  })
  logger.debug(`connecting to websocket url=${websocketUrl}`)

  const ws = new WebSocket(websocketUrl)
  const subByTopic = new Map<string, PubSub<unknown>>()
  const subscribedTopicsOnServer = new Set<string>()

  const ready = new Promise<void>((resolve) => {
    ws.onopen = () => {
      logger.debug('websocket connection opened')
      resolve()
    }
  })

  ws.onmessage = (event) => {
    const toClientMsg = ToClientMsg.parse(JSON.parse(event.data))

    logger.debug(`websocket message received type=${toClientMsg.t}`)

    if (isErr(toClientMsg)) {
      logger.error(`websocket message parse error error=${toClientMsg.error}`)
      return
    }

    switch (toClientMsg.value.t) {
      case 'subscribed': {
        const topicString = toTopicString(toClientMsg.value.topicName, toClientMsg.value.topicParams)
        logger.debug(`topic subscribed topicString=${topicString}`)
        subscribedTopicsOnServer.add(topicString)
        return
      }
      case 'unsubscribed': {
        const topicString = toTopicString(toClientMsg.value.topicName, toClientMsg.value.topicParams)
        logger.debug(`topic unsubscribed topicString=${topicString}`)
        subscribedTopicsOnServer.delete(topicString)
        return
      }
      case 'published': {
        const topicString = toTopicString(toClientMsg.value.topicName, toClientMsg.value.topicParams)
        const existingSub = subByTopic.get(topicString)
        if (!existingSub) {
          logger.debug(`no subscribers for topic=${topicString}`)
          return
        }
        const msg = JSON.parse(toClientMsg.value.msg)
        logger.debug(`publishing message to topic=${topicString}`)
        existingSub.pub(msg)
      }
    }
  }

  const send = async (msg: ToServerMsg) => {
    await ready
    logger.debug(`sending message type=${msg.t}`)
    ws.send(JSON.stringify(msg))
  }

  const syncSubscriptionsWithServer = throttleByKey({
    throttle: TimeSpan.seconds(3),

    keyFn: (_action, topicName, topicParams) => toTopicString(topicName, topicParams),

    fn: (action: 'subscribe' | 'unsubscribe', topicName: string[], topicParams: unknown) => {
      const isSubscribedOnServer = subscribedTopicsOnServer.has(toTopicString(topicName, topicParams))
      switch (action) {
        case 'subscribe': {
          if (isSubscribedOnServer) return
          send({ t: 'subscribe', topicName, topicParams })
          break
        }
        case 'unsubscribe': {
          if (!isSubscribedOnServer) return
          send({ t: 'unsubscribe', topicName, topicParams })
          break
        }
      }
    },
    behavior: 'leading',
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
            const toServerMsg: ToServerMsg = {
              t: 'publish',
              topicName,
              topicParams,
              msg: JSON.stringify(msg),
            }
            logger.debug(`publishing to topic=${topicName.join('.')}`)
            send(toServerMsg)
          },
          subscribe: (topicParams: unknown): Sub<any> => {
            const topicString = toTopicString(topicName, topicParams)

            syncSubscriptionsWithServer('subscribe', topicName, topicParams)

            const existing = subByTopic.get(topicString)

            if (existing) {
              logger.debug(`reusing existing subscription for topic=${topicString}`)
              return existing
            }

            logger.debug(`subscribing to topic=${topicString}`)

            const sub = PubSub.create()
            const subNew: PubSub<any> = {
              ...sub,
              sub(subscriber) {
                const unsub = sub.sub(subscriber)
                return () => {
                  unsub()
                  syncSubscriptionsWithServer('unsubscribe', topicName, topicParams)
                }
              },
            }

            subByTopic.set(topicString, subNew)

            return subNew
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
