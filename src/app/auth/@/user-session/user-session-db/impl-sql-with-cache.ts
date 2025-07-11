import { pipe } from '~/@/function/pipe'
import { KeyValueDb, IKeyValueDb } from '~/@/key-value-db'
import { ISqlDb } from '~/@/sql-db'
import { LRUCache } from '~/@/least-recently-used-cache'
import { ILogger } from '~/@/logger'
import { PubSub } from '~/@/pub-sub'
import { ITopicBasedPubSub } from '~/@/pub-sub-topic-based'
import * as ImplSql from './impl-sql'
import { WithCache } from './impl-with-cache'
import type { IUserSessionDb } from './interface'

export type Config = {
  t: 'sql-with-cache'
  keyValueDb: IKeyValueDb
  sqlDb: ISqlDb
  pubSubTopicBased: ITopicBasedPubSub
  logger: ILogger
}

export const UserSessionDb = (config: Config): IUserSessionDb => {
  const keyValueDb = pipe(
    config.keyValueDb,
    (keyValueDb) =>
      KeyValueDb({
        ...config,
        t: 'with-cache',
        source: keyValueDb,
        cache: KeyValueDb({
          ...config,
          t: 'with-distributed-invalidations',
          pubSub: PubSub({
            t: 'pub-sub-topic-based',
            pubSubTopicBased: config.pubSubTopicBased,
            topic: 'user-session-db-cache-invalidation',
          }),
          cache: KeyValueDb({
            t: 'hash-map',
            map: LRUCache({ maxCapacity: 2000 }),
          }),
        }),
      }),

    (keyValueDb) =>
      KeyValueDb({
        ...config,
        t: 'with-reduced-parsing',
        keyValueDb,
        verifiedKeys: new Set(),
      }),
  )

  const userSessionDb = ImplSql.UserSessionDb({
    t: 'sql',
    sqlDb: config.sqlDb,
    logger: config.logger,
  })

  return WithCache({
    keyValueDb,
    userSessionDb,
  })
}
