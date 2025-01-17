import * as ImplBunSqlite from './impl-bun-sqlite'
import * as ImplNoop from './impl-noop'
import * as ImplPgLite from './impl-pglite'
import * as ImplPostgres from './impl-postgres'
import * as ImplPowerSync from './impl-powersync'
import type { IDbConnSql } from './interface'

export type Config =
  | ImplPostgres.Config
  | ImplNoop.Config
  | ImplPgLite.Config
  | ImplPowerSync.Config
  | ImplBunSqlite.Config

export const DbConnSql = async (config: Config): Promise<IDbConnSql> => {
  switch (config.t) {
    case 'noop': {
      return ImplNoop.DbConnSql(config)
    }
    case 'postgres': {
      return ImplPostgres.DbConnSql(config)
    }
    case 'bun-sqlite': {
      return ImplBunSqlite.DbConnSql(config)
    }
    case 'pglite': {
      return ImplPgLite.DbConnSql(config)
    }
    case 'powersync': {
      return ImplPowerSync.DbConnSql(config)
    }
  }
}
