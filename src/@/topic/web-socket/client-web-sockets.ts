import { ILogger, Logger } from '~/@/logger'
import { isErr } from '~/@/result'
import { PubSub, Sub } from '~/@/sub'
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
  const subByTopic = new Map<
    string,
    {
      topicName: string[]
      topicParams: unknown
      sub: PubSub<unknown>
    }
  >()

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
        logger.debug(`topic subscribed topicName=${toClientMsg.value.topicName.join('.')}`)
        return
      }
      case 'unsubscribed': {
        logger.debug(`topic unsubscribed topicName=${toClientMsg.value.topicName.join('.')}`)
        return
      }
      case 'published': {
        const topicString = toTopicString({
          topicName: toClientMsg.value.topicName,
          topicParams: toClientMsg.value.topicParams,
        })
        const existingSub = subByTopic.get(topicString)
        if (!existingSub) {
          logger.debug(`no subscribers for topic=${topicString}`)
          return
        }
        const msg = JSON.parse(toClientMsg.value.msg)
        logger.debug(`publishing message to topic=${topicString}`)
        existingSub.sub.pub(msg)
      }
    }
  }

  const send = async (msg: unknown) => {
    await ready
    logger.debug(`sending message type=${(msg as ToServerMsg).t}`)
    ws.send(JSON.stringify(msg))
  }

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
            const topicString = toTopicString({
              topicName,
              topicParams,
            })

            const existingSub = subByTopic.get(topicString)

            if (existingSub) {
              logger.debug(`reusing existing subscription for topic=${topicString}`)
              const toServerMsg: ToServerMsg = {
                t: 'subscribe',
                topicName,
                topicParams,
              }

              send(toServerMsg)

              return existingSub.sub
            }

            logger.debug(`subscribing to topic=${topicString}`)

            const sub = PubSub.create()

            subByTopic.set(topicString, { topicName, topicParams, sub })

            const toServerMsg: ToServerMsg = {
              t: 'subscribe',
              topicName,
              topicParams,
            }

            send(toServerMsg)

            return {
              ...sub,
              sub(subscriber) {
                const unsub = sub.sub(subscriber)
                return () => {
                  unsub()
                  const toServerMsg: ToServerMsg = {
                    t: 'unsubscribe',
                    topicName,
                    topicParams,
                  }
                  send(toServerMsg)
                }
              },
            }
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
