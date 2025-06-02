import { SqlDb } from '../sql-db'
import { ILogger } from '../logger'
import { sleep } from '../promise/sleep'
import { TimeSpan } from '../time/time-span'
import { IPubSubTopicBased } from './interface'

export type Config = {
  t: 'postgres'
  dbConnSql: SqlDb
  logger: ILogger
}

export const PubSubTopicBased = (config: Config): IPubSubTopicBased => {
  const unlistenByTopic = new Map<string, Set<() => void>>()

  return {
    async pub(topic, msg) {
      await config.dbConnSql.notify(topic, msg)
      await sleep(TimeSpan.milliseconds(0))
      config.logger.debug(`pub: topic=${topic} msg=${JSON.stringify(msg).slice(0, 1000)}`)
    },
    async sub(topic, callback) {
      const unlisten = await config.dbConnSql.listen(topic, (notification) => {
        config.logger.debug(`sub: topic=${topic} notification=${JSON.stringify(notification).slice(0, 1000)}`)
        callback(notification.payload ?? '')
      })
      const unlistens = unlistenByTopic.get(topic) ?? new Set()
      unlistens.add(unlisten)
      unlistenByTopic.set(topic, unlistens)

      config.logger.debug(`sub: topic=${topic}`)

      return async () => {
        await unlisten()
        const unlistens = unlistenByTopic.get(topic) ?? new Set()
        unlistens.delete(unlisten)
        unlistenByTopic.set(topic, unlistens)
        config.logger.debug(`unsub: topic=${topic}`)
      }
    },
    async unsub(topic) {
      const unlistens = unlistenByTopic.get(topic) ?? []
      for (const unlisten of unlistens) {
        unlisten()
      }
      unlistenByTopic.delete(topic)
      config.logger.debug(`unsub: topic=${topic}`)
    },
  }
}
