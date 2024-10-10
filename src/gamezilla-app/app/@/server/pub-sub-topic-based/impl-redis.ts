import { Parser } from 'gamezilla-app/@/core/parser/parser'
import { Redis } from 'ioredis'
import { ILogger } from '../logger'
import { IPubSubTopicBased } from './interface'

export type Config<T> = {
  t: 'redis'
  parser: Parser<T>
  redisUrl: string
  logger: ILogger
}

const MAX_MSG_LENGTH = 100
let publisher: Redis
export const PubSubTopicBased = async <TMsg>(config: Config<TMsg>): Promise<IPubSubTopicBased<TMsg>> => {
  publisher ??= new Redis(config.redisUrl)
  publisher.on('error', (err) => {
    config.logger.error(`publisher error: ${err}`)
  })
  await publisher.ping()

  let runningSubscriberId = 0
  const subscribers = new Map<number, Redis>()

  return {
    async pub(topic, msg) {
      await publisher.publish(topic, JSON.stringify(msg))
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
      subscriber.on('message', (subscribedTopic, msg) => {
        if (subscribedTopic === topic) {
          const parsed = config.parser.parse(JSON.parse(msg))
          if (parsed.t === 'ok') {
            config.logger.debug(`sub: topic=${topic} msg=${JSON.stringify(parsed.value).slice(0, MAX_MSG_LENGTH)}`)
            callback(parsed.value)
          } else {
            config.logger.error(`sub: topic=${topic} msg=${JSON.stringify(parsed.error)}`)
          }
        }
      })

      config.logger.debug(`sub: topic=${topic}`)

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
