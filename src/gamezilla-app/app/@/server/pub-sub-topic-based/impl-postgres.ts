import { IDbConnSql } from '../db-conn-sql'
import { ILogger } from '../logger'
import { IPubSubTopicBased } from './interface'

export type Config<T> = {
  t: 'postgres'
  dbConnSql: IDbConnSql
  encode: (msg: T) => string
  decode: (msg: string) => T | null
  logger: ILogger
}

export const PubSubTopicBased = <TMsg>(config: Config<TMsg>): IPubSubTopicBased<TMsg> => {
  const unlistensByTopic = new Map<string, Set<() => void>>()
  return {
    async pub(topic, msg) {
      await config.dbConnSql.notify(topic, config.encode(msg))
      await new Promise((resolve) => setTimeout(resolve, 0))
      config.logger.debug(`pub: topic=${topic} msg=${JSON.stringify(msg).slice(0, 1000)}`)
    },
    async sub(topic, callback) {
      const unlisten = await config.dbConnSql.listen(topic, (notification) => {
        config.logger.debug(`sub: topic=${topic} notification=${JSON.stringify(notification).slice(0, 1000)}`)
        try {
          const msg = config.decode(notification.payload ?? '')
          if (msg) {
            callback(msg)
          }
        } catch (err) {
          config.logger.error(
            `sub: topic=${topic} err=${err} notification=${JSON.stringify(notification).slice(0, 1000)}`
          )
        }
      })
      const unlistens = unlistensByTopic.get(topic) ?? new Set()
      unlistens.add(unlisten)
      unlistensByTopic.set(topic, unlistens)

      config.logger.debug(`sub: topic=${topic}`)

      return async () => {
        await unlisten()
        const unlistens = unlistensByTopic.get(topic) ?? new Set()
        unlistens.delete(unlisten)
        unlistensByTopic.set(topic, unlistens)
        config.logger.debug(`unsub: topic=${topic}`)
      }
    },
    async unsub(topic) {
      const unlistens = unlistensByTopic.get(topic) ?? []
      for (const unlisten of unlistens) {
        unlisten()
      }
      unlistensByTopic.delete(topic)
      config.logger.debug(`unsub: topic=${topic}`)
    }
  }
}
