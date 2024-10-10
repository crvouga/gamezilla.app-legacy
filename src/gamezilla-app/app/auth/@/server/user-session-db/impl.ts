import { pipe } from 'gamezilla-app/@/core'
import { LRUCache } from 'gamezilla-app/@/least-recently-used-cache'
import { DbConnKv, IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { IDbConnSql } from 'gamezilla-app/app/@/server/db-conn-sql'
import { ILogger } from 'gamezilla-app/app/@/server/logger'
import { IPubSub, PubSub } from 'gamezilla-app/app/@/server/pub-sub'
import * as ImplInMemory from './impl-in-memory'
import * as ImplPostgres from './impl-postgres'
import type { IUserSessionDb } from './interface'
import { WithCache } from './with-cache'

export type Config =
  | ImplInMemory.Config
  | ImplPostgres.Config
  | {
      t: 'postgres-with-cache'
      dbConnKv: IDbConnKv
      dbConnSql: IDbConnSql
      logger: ILogger
    }
  | {
      t: 'postgres-with-fast-cache'
      dbConnKv: IDbConnKv
      dbConnSql: IDbConnSql
      pubSub: IPubSub
      logger: ILogger
    }

export const UserSessionDb = async (config: Config): Promise<IUserSessionDb> => {
  switch (config.t) {
    case 'in-memory': {
      return ImplInMemory.UserSessionDb(config)
    }

    case 'postgres': {
      return ImplPostgres.UserSessionDb(config)
    }

    case 'postgres-with-cache': {
      return WithCache({
        userSessionDb: ImplPostgres.UserSessionDb({ t: 'postgres', dbConnSql: config.dbConnSql }),
        dbConnKv: config.dbConnKv
      })
    }

    case 'postgres-with-fast-cache': {
      const dbConnKv = await pipe(
        config.dbConnKv,

        async (dbConnKv) =>
          true
            ? DbConnKv.withCache({
                ...config,
                source: dbConnKv,
                cache: await DbConnKv.withDistributedInvalidations({
                  ...config,
                  pubSub: await PubSub({ t: 'in-memory' }),
                  cache: await DbConnKv({
                    t: 'hash-map',
                    map: LRUCache({ maxCapacity: 2000 })
                  })
                })
              })
            : dbConnKv,

        async (dbConnKv) =>
          DbConnKv.withReducedParsing({
            ...config,
            dbConnKv: await dbConnKv,
            verifiedKeys: new Set()
          })
      )

      return WithCache({
        dbConnKv,
        userSessionDb: ImplPostgres.UserSessionDb({ t: 'postgres', dbConnSql: config.dbConnSql })
      })
    }
  }
}
