import { IDbConnSql } from '../db-conn-sql'
import { IPubSubTopicBased } from './interface'

export type Config<T> = {
  t: 'postgres'
  dbConnSql: IDbConnSql
  encode: (msg: T) => string
  decode: (msg: string) => T | null
}

export const PubSubTopicBased = <TMsg>(config: Config<TMsg>): IPubSubTopicBased<TMsg> => {
  const unlistensByTopic = new Map<string, Set<() => void>>()
  return {
    async pub(topic, msg) {
      await config.dbConnSql.notify(topic, config.encode(msg))
      await new Promise((resolve) => setTimeout(resolve, 0))
    },
    async sub(topic, callback) {
      const unlisten = await config.dbConnSql.listen(topic, (notification) => {
        try {
          const msg = config.decode(notification.payload ?? '')
          if (msg) {
            callback(msg)
          }
        } catch (err) {
          console.error(err)
        }
      })
      const unlistens = unlistensByTopic.get(topic) ?? new Set()
      unlistens.add(unlisten)
      unlistensByTopic.set(topic, unlistens)

      return async () => {
        await unlisten()
      }
    },
    async unsub(topic) {
      const unlistens = unlistensByTopic.get(topic) ?? []
      for (const unlisten of unlistens) {
        unlisten()
      }
    }
  }
}
