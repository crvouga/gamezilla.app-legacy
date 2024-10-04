import { IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { IDbConnSql } from 'gamezilla-app/app/@/server/db-conn-sql'
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

export const UserSessionDb = (impl: Config): IUserSessionDb => {
  switch (impl.t) {
    case 'in-memory': {
      return ImplInMemory.UserSessionDb(impl)
    }

    case 'postgres': {
      return ImplPostgres.UserSessionDb(impl)
    }

    case 'postgres-with-cache': {
      return WithCache({
        userSessionDb: ImplPostgres.UserSessionDb({
          t: 'postgres',
          dbConnSql: impl.dbConnSql
        }),
        dbConnKv: impl.dbConnKv
      })
    }
  }
}
