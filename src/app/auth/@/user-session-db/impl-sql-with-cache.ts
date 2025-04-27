import { pipe } from '~/@/function/pipe'
import { KeyValueDb, IKeyValueDb } from '~/@/key-value-db'
import { IDbConnSql } from '~/@/db-conn-sql'
import { LRUCache } from '~/@/least-recently-used-cache'
import { ILogger } from '~/@/logger'
import { PubSub } from '~/@/pub-sub'
import { IPubSubTopicBased } from '~/@/pub-sub-topic-based'
import * as ImplSql from './impl-sql'
import { WithCache } from './impl-with-cache'
import type { IUserSessionDb } from './interface'

export type Config = {
  t: 'sql-with-cache'
  keyValueDb: IKeyValueDb
  dbConnSql: IDbConnSql
  pubSubTopicBased: IPubSubTopicBased
  logger: ILogger
}

export const UserSessionDb = async (config: Config): Promise<IUserSessionDb> => {
  const keyValueDb = await pipe(
    config.keyValueDb,
    async (keyValueDb) =>
      KeyValueDb({
        ...config,
        t: 'with-cache',
        source: keyValueDb,
        cache: await KeyValueDb({
          ...config,
          t: 'with-distributed-invalidations',
          pubSub: await PubSub({
            t: 'pub-sub-topic-based',
            pubSubTopicBased: config.pubSubTopicBased,
            topic: 'user-session-db-cache-invalidation',
          }),
          cache: await KeyValueDb({
            t: 'hash-map',
            map: LRUCache({ maxCapacity: 2000 }),
          }),
        }),
      }),

    async (keyValueDb) =>
      KeyValueDb({
        ...config,
        t: 'with-reduced-parsing',
        keyValueDb: await keyValueDb,
        verifiedKeys: new Set(),
      }),
  )

  const userSessionDb = ImplSql.UserSessionDb({
    t: 'sql',
    dbConnSql: config.dbConnSql,
    logger: config.logger,
  })

  return WithCache({
    keyValueDb,
    userSessionDb,
  })
}
