import * as ImplBetterSqlite3 from '../impl-better-sqlite3/impl-better-sqlite3'
import * as ImplNoop from '../impl-noop'
import * as ImplPglite from '../impl-pglite'
import * as ImplPostgres from '../impl-postgres'
import type { ISqlDb } from '../interface'

export type Config = ImplPostgres.Config | ImplNoop.Config | ImplBetterSqlite3.Config | ImplPglite.Config

export const SqlDb = (config: Config): ISqlDb => {
  switch (config.t) {
    case 'noop': {
      return ImplNoop.SqlDb(config)
    }
    case 'postgres': {
      return ImplPostgres.SqlDb(config)
    }
    case 'better-sqlite3': {
      return ImplBetterSqlite3.SqlDb(config)
    }
    case 'pglite': {
      return ImplPglite.SqlDb(config)
    }
  }
}
