import { ILogger } from '../logger'
import { IRedis, newRedis } from '../redis'
import { IPubSubTopicBased } from './interface'

export type Config = {
  t: 'redis'
  redisUrl: string
  logger: ILogger
}

const MAX_MSG_LOG_LENGTH = 100
let publisher: IRedis
let hasSubscribed = false
export const PubSubTopicBased = async (config: Config): Promise<IPubSubTopicBased> => {
  publisher ??= newRedis(config.redisUrl)
  if (!hasSubscribed) {
    publisher.on('error', (err) => {
      config.logger.error(`publisher error: ${err}`)
    })
    hasSubscribed = true
  }
  await publisher.ping()

  let runningSubscriberId = 0
  const subscribers = new Map<number, IRedis>()

  return {
    async pub(topic, msg) {
      await publisher.publish(topic, JSON.stringify(msg))
      await new Promise((resolve) => setTimeout(resolve, 0))
      config.logger.debug(`pub: topic=${topic} msg=${JSON.stringify(msg).slice(0, MAX_MSG_LOG_LENGTH)}`)
    },
    async sub(topic, callback) {
      const id = runningSubscriberId
      runningSubscriberId++
      const subscriber = newRedis(config.redisUrl)
      subscriber.on('error', (err) => {
        config.logger.error(`subscriber error: ${err}`)
      })
      await subscriber.subscribe(topic)
      subscribers.set(id, subscriber)
      subscriber.on('message', (_subscribedTopic, msg) => {
        config.logger.debug(`sub: topic=${topic} msg=${JSON.stringify(msg).slice(0, MAX_MSG_LOG_LENGTH)}`)
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
    },
  }
}
