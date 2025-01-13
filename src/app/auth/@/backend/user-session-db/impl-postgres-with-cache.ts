import { pipe } from '~/@/function/pipe'
import { DbConnKv, IDbConnKv } from '~/@/db-conn-kv'
import { IDbConnSql } from '~/@/db-conn-sql'
import { LRUCache } from '~/@/least-recently-used-cache'
import { ILogger } from '~/@/logger'
import { PubSub } from '~/@/pub-sub'
import { IPubSubTopicBased } from '~/@/pub-sub-topic-based'
import * as ImplPostgres from './impl-postgres'
import { WithCache } from './impl-with-cache'
import type { IUserSessionDb } from './interface'

export type Config = {
  t: 'postgres-with-cache'
  dbConnKv: IDbConnKv
  dbConnSql: IDbConnSql
  pubSubTopicBased: IPubSubTopicBased
  logger: ILogger
}

export const UserSessionDb = async (config: Config): Promise<IUserSessionDb> => {
  const dbConnKv = await pipe(
    config.dbConnKv,
    async (dbConnKv) =>
      DbConnKv({
        ...config,
        t: 'with-cache',
        source: dbConnKv,
        cache: await DbConnKv({
          ...config,
          t: 'with-distributed-invalidations',
          pubSub: await PubSub({
            t: 'pub-sub-topic-based',
            pubSubTopicBased: config.pubSubTopicBased,
            topic: 'user-session-db-cache-invalidation',
          }),
          cache: await DbConnKv({
            t: 'hash-map',
            map: LRUCache({ maxCapacity: 2000 }),
          }),
        }),
      }),

    async (dbConnKv) =>
      DbConnKv({
        ...config,
        t: 'with-reduced-parsing',
        dbConnKv: await dbConnKv,
        verifiedKeys: new Set(),
      }),
  )

  const userSessionDb = ImplPostgres.UserSessionDb({
    t: 'postgres',
    dbConnSql: config.dbConnSql,
    logger: config.logger,
  })

  return WithCache({
    dbConnKv,
    userSessionDb,
  })
}
