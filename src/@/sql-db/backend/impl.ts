import * as ImplBunSqlite from '../impl-bun-sqlite/impl-bun-sqlite'
import * as ImplNoop from '../impl-noop'
import * as ImplPgLite from '../impl-pglite/impl-pglite'
import * as ImplPostgres from '../impl-postgres'
import * as ImplPowerSync from '../impl-powersync-client'
import type { ISqlDb } from '../interface'

export type Config =
  | ImplPostgres.Config
  | ImplNoop.Config
  | ImplPgLite.Config
  | ImplPowerSync.Config
  | ImplBunSqlite.Config

export const SqlDb = async (config: Config): Promise<ISqlDb> => {
  switch (config.t) {
    case 'noop': {
      return ImplNoop.SqlDb(config)
    }
    case 'postgres': {
      return ImplPostgres.SqlDb(config)
    }
    case 'bun-sqlite': {
      return ImplBunSqlite.SqlDb(config)
    }
    case 'pglite': {
      return ImplPgLite.SqlDb(config)
    }
    case 'powersync-client': {
      return ImplPowerSync.SqlDb(config)
    }
  }
}
