import { ILogger, Logger } from '~/@/logger'
import { PubSub, Sub } from '~/@/sub'
import { Client, Contract } from '../types'
import { toTopicString } from './shared'

export type Config<T extends Contract<any>> = {
  t: 'local'
  contract: T
  logger: ILogger
}

export const initClient = <T extends Contract<any>>(config: Config<T>): Client<T> => {
  const logger = Logger.prefix('client', config.logger)
  const subByTopic = new Map<string, PubSub<unknown>>()

  const createClientRecursive = (currentContract: Contract<any>, runningTopicName: string[] = []): any => {
    const clientProxy: any = {}

    for (const topicNamePart in currentContract) {
      const topicConfig = currentContract[topicNamePart]

      if (!topicConfig) continue

      const topicName: string[] = [...runningTopicName, topicNamePart]

      if ('params' in topicConfig && 'msg' in topicConfig) {
        clientProxy[topicNamePart] = {
          publish: (topicParams: unknown, msg: unknown) => {
            const topicString = toTopicString(topicName, topicParams)
            const existingSub = subByTopic.get(topicString)
            if (!existingSub) {
              logger.debug(`no subscribers for topic=${topicString}`)
              return
            }
            logger.debug(`publishing message to topic=${topicString}`)
            existingSub.pub(msg)
          },
          subscribe: (topicParams: unknown): Sub<any> => {
            const topicString = toTopicString(topicName, topicParams)

            const existingSub = subByTopic.get(topicString)

            if (existingSub) {
              logger.debug(`reusing existing subscription for topic=${topicString}`)
              return existingSub
            }

            logger.debug(`subscribing to topic=${topicString}`)
            const pubSub = Sub.create()
            subByTopic.set(topicString, pubSub)

            return {
              ...pubSub,
              sub(subscriber) {
                const unsub = pubSub.sub(subscriber)
                return () => {
                  unsub()
                  logger.debug(`unsubscribing from topic=${topicString}`)
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
