import { pipe } from '~/@/function/pipe'
import { IKeyValueDb, KeyValueDb } from '~/@/key-value-db'
import { LRUCache } from '~/@/least-recently-used-cache'
import { ILogger } from '~/@/logger'
import { PubSub } from '~/@/pub-sub'
import { ITopicBasedPubSub } from '~/@/pub-sub-topic-based'
import { ISqlDb } from '~/@/sql-db/interface'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import * as ImplSql from './impl-sql-db'
import { WithCache } from './impl-with-cache'
import type { IUserSessionDb } from './interface'

export type Config = {
  t: 'sql-with-cache'
  keyValueDb: IKeyValueDb
  sqlDb: ISqlDb
  pubSubTopicBased: ITopicBasedPubSub
  logger: ILogger
  migrationPolicy: ISqlDbMigrationPolicy
}

export const UserSessionDb = async (config: Config): Promise<IUserSessionDb> => {
  const keyValueDb = pipe(
    config.keyValueDb,
    (keyValueDb) =>
      KeyValueDb.init({
        ...config,
        t: 'with-cache',
        source: keyValueDb,
        cache: KeyValueDb.init({
          ...config,
          t: 'with-distributed-invalidations',
          pubSub: PubSub({
            t: 'pub-sub-topic-based',
            pubSubTopicBased: config.pubSubTopicBased,
            topic: 'user-session-db-cache-invalidation',
          }),
          cache: KeyValueDb.init({
            t: 'hash-map',
            map: LRUCache({ maxCapacity: 2000 }),
          }),
        }),
      }),

    (keyValueDb) =>
      KeyValueDb.init({
        ...config,
        t: 'with-reduced-parsing',
        keyValueDb,
        verifiedKeys: new Set(),
      }),
  )

  const userSessionDb = await ImplSql.UserSessionDb({ ...config, t: 'sql' })

  return WithCache({
    keyValueDb,
    userSessionDb,
  })
}
