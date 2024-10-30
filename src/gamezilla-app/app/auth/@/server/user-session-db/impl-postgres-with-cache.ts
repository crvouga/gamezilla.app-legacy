import { pipe } from 'gamezilla-app/@/core'
import { LRUCache } from 'gamezilla-app/@/least-recently-used-cache'
import { DbConnKv, IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { IDbConnSql } from 'gamezilla-app/app/@/server/db-conn-sql'
import { ILogger } from 'gamezilla-app/app/@/server/logger'
import { IPubSubTopicBased } from 'gamezilla-app/app/@/server/pub-sub-topic-based'
import * as ImplPostgres from './impl-postgres'
import type { IUserSessionDb } from './interface'
import { WithCache } from './impl-with-cache'

export type Config = {
  t: 'postgres-with-cache'
  dbConnKv: IDbConnKv
  dbConnSql: IDbConnSql
  pubSub: IPubSubTopicBased
  logger: ILogger
}

export const UserSessionDb = async (config: Config): Promise<IUserSessionDb> => {
  const dbConnKv = await pipe(
    config.dbConnKv,
    async (dbConnKv) =>
      DbConnKv.withCache({
        ...config,
        source: dbConnKv,
        cache: await DbConnKv.withDistributedInvalidations({
          ...config,
          pubSub: config.pubSub,
          cache: await DbConnKv({
            t: 'hash-map',
            map: LRUCache({ maxCapacity: 2000 })
          })
        })
      }),

    async (dbConnKv) =>
      DbConnKv.withReducedParsing({
        ...config,
        dbConnKv: await dbConnKv,
        verifiedKeys: new Set()
      })
  )

  const userSessionDb = ImplPostgres.UserSessionDb({
    t: 'postgres',
    dbConnSql: config.dbConnSql,
    logger: config.logger
  })

  return WithCache({
    dbConnKv,
    userSessionDb
  })
}
