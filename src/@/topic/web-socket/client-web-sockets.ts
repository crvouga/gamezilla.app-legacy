import { ILogger, Logger } from '~/@/logger'
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

type TopicSubscriptionInfo = {
  pubSub: PubSub<unknown>
  topicName: string[]
  topicParams: unknown
}

export const initClient = <T extends Contract<any>>(config: Config<T>): Client<T> => {
  const logger = Logger.prefix('client', config.logger)

  const websocketUrl = toWebsocketUrl({
    serverUrl: config.serverUrl,
    endpoint: config.endpoint,
    clientSessionId: config.clientSessionId,
  })

  let ws: WebSocket | null = null
  let resolveCurrentReady: () => void = () => {}
  let currentReadyPromise: Promise<void> = new Promise<void>((resolve) => {
    resolveCurrentReady = resolve
  })

  const subByTopic = new Map<string, TopicSubscriptionInfo>()
  const subscribedTopicsOnServer = new Set<string>()

  let reconnectAttempts = 0
  const maxReconnectDelayMs = TimeSpan.toMilliseconds(TimeSpan.seconds(30))
  const baseReconnectDelayMs = TimeSpan.toMilliseconds(TimeSpan.seconds(1))

  const createNewReadyPromise = () => {
    currentReadyPromise = new Promise<void>((resolve) => {
      resolveCurrentReady = resolve
    })
  }

  const connect = () => {
    logger.debug(`attempting to connect to websocket url=${websocketUrl}`)

    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      logger.debug('WebSocket already open or connecting. Ensuring ready promise is resolved if open.')
      if (ws.readyState === WebSocket.OPEN) {
        resolveCurrentReady()
      }
      return
    }

    if (ws) {
      ws.onopen = null
      ws.onmessage = null
      ws.onclose = null
      ws.onerror = null
      if (ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
        ws.close()
      }
    }

    try {
      ws = new WebSocket(websocketUrl)
    } catch (error) {
      logger.error('Failed to create WebSocket instance:', error)
      createNewReadyPromise()
      const delay = Math.min(maxReconnectDelayMs, baseReconnectDelayMs * 2 ** reconnectAttempts)
      reconnectAttempts++
      logger.info(
        `will attempt to reconnect (after create error) in ${delay / 1000} seconds... (attempt ${reconnectAttempts})`,
      )
      setTimeout(connect, delay)
      return
    }

    ws.onopen = () => {
      logger.debug('websocket connection opened')
      resolveCurrentReady()
      reconnectAttempts = 0

      logger.debug('re-establishing subscriptions post-connection...')
      for (const { topicName, topicParams } of subByTopic.values()) {
        const topicString = toTopicString(topicName, topicParams)
        logger.debug(`re-queueing subscription for ${topicString}`)
        syncSubscriptionsWithServer('subscribe', topicName, topicParams)
      }
    }

    ws.onmessage = (event) => {
      const toClientMsg: ToClientMsg = JSON.parse(event.data as string) as ToClientMsg
      logger.debug(`websocket message received type=${toClientMsg.t}`)

      switch (toClientMsg.t) {
        case 'subscribed': {
          const topicString = toTopicString(toClientMsg.topicName, toClientMsg.topicParams)
          logger.debug(`topic subscribed confirmed by server: topicString=${topicString}`)
          subscribedTopicsOnServer.add(topicString)
          return
        }
        case 'unsubscribed': {
          const topicString = toTopicString(toClientMsg.topicName, toClientMsg.topicParams)
          logger.debug(`topic unsubscribed confirmed by server: topicString=${topicString}`)
          subscribedTopicsOnServer.delete(topicString)
          return
        }
        case 'published': {
          const topicString = toTopicString(toClientMsg.topicName, toClientMsg.topicParams)
          const existingSubEntry = subByTopic.get(topicString)
          if (!existingSubEntry) {
            logger.debug(`no local subscribers for incoming message on topic=${topicString}`)
            return
          }
          const msg = JSON.parse(toClientMsg.msg)
          logger.debug(`publishing message to local subscribers for topic=${topicString}`)
          existingSubEntry.pubSub.pub(msg)
        }
      }
    }

    ws.onclose = (event) => {
      logger.warn(`websocket connection closed. code=${event.code}, reason=${event.reason}, wasClean=${event.wasClean}`)
      ws = null
      subscribedTopicsOnServer.clear()

      createNewReadyPromise()

      const delay = Math.min(maxReconnectDelayMs, baseReconnectDelayMs * 2 ** reconnectAttempts)
      reconnectAttempts++
      logger.info(`will attempt to reconnect in ${delay / 1000} seconds... (attempt ${reconnectAttempts})`)
      setTimeout(connect, delay)
    }

    ws.onerror = (errorEvent) => {
      logger.error('websocket error:', errorEvent)
      // onclose will be called after onerror, handling reconnection.
    }
  }

  connect()

  const send = async (msg: ToServerMsg) => {
    await currentReadyPromise
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      logger.warn(
        `cannot send message type=${msg.t}, websocket not open. State: ${ws?.readyState ?? null}. Message dropped.`,
      )
      return
    }

    logger.debug(`sending message type=${msg.t} to topic=${toTopicString(msg.topicName, msg.topicParams)}`)
    ws.send(JSON.stringify(msg))
  }

  const syncSubscriptionsWithServer = throttleByKey({
    throttle: TimeSpan.seconds(3),
    keyFn: (_action, topicName, topicParams) => toTopicString(topicName, topicParams),
    fn: (action: 'subscribe' | 'unsubscribe', topicName: string[], topicParams: unknown) => {
      const topicString = toTopicString(topicName, topicParams)
      const isSubscribedOnServer = subscribedTopicsOnServer.has(topicString)

      switch (action) {
        case 'subscribe': {
          if (isSubscribedOnServer) {
            logger.debug(`already subscribed on server for ${topicString}, not sending subscribe request`)
            return
          }
          logger.debug(`sending 'subscribe' request to server for ${topicString}`)
          send({ t: 'subscribe', topicName, topicParams })
          break
        }
        case 'unsubscribe': {
          if (!isSubscribedOnServer) {
            logger.debug(`not subscribed on server for ${topicString}, not sending unsubscribe request`)
            return
          }
          logger.debug(`sending 'unsubscribe' request to server for ${topicString}`)
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
            logger.debug(`queuing publish to topic=${topicName.join('.')}`)
            send(toServerMsg)
          },
          subscribe: (topicParams: unknown, mapper: (msg: any) => any): Sub<any> => {
            const topicString = toTopicString(topicName, topicParams)
            const existingEntry = subByTopic.get(topicString)

            if (existingEntry) {
              logger.debug(`reusing existing local subscription for topic=${topicString}`)
              return existingEntry.pubSub
            }

            logger.debug(`creating new local subscription for topic=${topicString}`)
            syncSubscriptionsWithServer('subscribe', topicName, topicParams)

            const sub = PubSub.create()
            const subNew: PubSub<any> = {
              ...sub,
              sub(subscriber) {
                const unsub = sub.sub((msg) => subscriber(mapper(msg)))
                return () => {
                  unsub()
                  logger.debug(`local subscriber unsubscribed from ${topicString}, attempting to sync with server`)
                  syncSubscriptionsWithServer('unsubscribe', topicName, topicParams)
                }
              },
            }
            subByTopic.set(topicString, { pubSub: subNew, topicName, topicParams })
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
