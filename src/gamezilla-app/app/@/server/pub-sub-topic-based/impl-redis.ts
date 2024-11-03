import { Redis } from 'ioredis'
import { ILogger } from '../logger'
import { IPubSubTopicBased } from './interface'

export type Config = {
  t: 'redis'
  redisUrl: string
  logger: ILogger
}

const MAX_MSG_LENGTH = 100
let publisher: Redis
let hasSubscribed = false
export const PubSubTopicBased = async (config: Config): Promise<IPubSubTopicBased> => {
  publisher ??= new Redis(config.redisUrl)
  if (!hasSubscribed) {
    publisher.on('error', (err) => {
      config.logger.error(`publisher error: ${err}`)
    })
    hasSubscribed = true
  }
  await publisher.ping()

  let runningSubscriberId = 0
  const subscribers = new Map<number, Redis>()

  return {
    async pub(topic, msg) {
      await publisher.publish(topic, JSON.stringify(msg))
      await new Promise((resolve) => setTimeout(resolve, 0))
      config.logger.debug(`pub: topic=${topic} msg=${JSON.stringify(msg).slice(0, MAX_MSG_LENGTH)}`)
    },
    async sub(topic, callback) {
      const id = runningSubscriberId
      runningSubscriberId++
      const subscriber = new Redis(config.redisUrl)
      subscriber.on('error', (err) => {
        config.logger.error(`subscriber error: ${err}`)
      })
      await subscriber.subscribe(topic)
      subscribers.set(id, subscriber)
      subscriber.on('message', (_subscribedTopic, msg) => {
        config.logger.debug(`sub: topic=${topic} msg=${JSON.stringify(msg).slice(0, MAX_MSG_LENGTH)}`)
        callback(msg)
      })
      config.logger.debug(`sub: topic=${topic}`)
      await new Promise((resolve) => setTimeout(resolve, 0))
      return async () => {
        await subscriber.unsubscribe(topic)
        subscribers.delete(id)
      }
    },
    async unsub(topic) {
      for (const [id, subscriber] of subscribers.entries()) {
        await subscriber.unsubscribe(topic)
        subscribers.delete(id)
      }
      config.logger.debug(`unsub: topic=${topic}`)
    }
  }
}
