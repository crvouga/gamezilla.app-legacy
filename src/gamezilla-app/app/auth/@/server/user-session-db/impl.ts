import { pipe } from 'gamezilla-app/@/core'
import { LRUCache } from 'gamezilla-app/@/least-recently-used-cache'
import { DbConnKv, IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { IDbConnSql } from 'gamezilla-app/app/@/server/db-conn-sql'
import { Logger } from 'gamezilla-app/app/@/server/logger'
import { PubSub } from 'gamezilla-app/app/@/server/pub-sub'
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
    }
  | {
      t: 'postgres-with-fast-cache'
      dbConnKv: IDbConnKv
      dbConnSql: IDbConnSql
    }

export const UserSessionDb = async (impl: Config): Promise<IUserSessionDb> => {
  switch (impl.t) {
    case 'in-memory': {
      return ImplInMemory.UserSessionDb(impl)
    }

    case 'postgres': {
      return ImplPostgres.UserSessionDb(impl)
    }

    case 'postgres-with-cache': {
      return WithCache({
        userSessionDb: ImplPostgres.UserSessionDb({ t: 'postgres', dbConnSql: impl.dbConnSql }),
        dbConnKv: impl.dbConnKv
      })
    }

    case 'postgres-with-fast-cache': {
      const dbConnKv = await pipe(
        impl.dbConnKv,

        async (dbConnKv) =>
          false
            ? DbConnKv.withCache({
                logger: Logger({ t: 'noop' }),
                source: dbConnKv,
                cache: DbConnKv.withDistributedInvalidations({
                  logger: Logger({ t: 'noop' }),
                  pubSub: PubSub({ t: 'in-memory' }),
                  dbConnKv: await DbConnKv({ t: 'hash-map', map: LRUCache({ maxCapacity: 2000 }) })
                })
              })
            : dbConnKv,

        async (dbConnKv) =>
          DbConnKv.withReducedParsing({
            dbConnKv: await dbConnKv,
            verifiedKeys: new Set()
          })
      )

      return WithCache({
        dbConnKv,
        userSessionDb: ImplPostgres.UserSessionDb({ t: 'postgres', dbConnSql: impl.dbConnSql })
      })
    }
  }
}
