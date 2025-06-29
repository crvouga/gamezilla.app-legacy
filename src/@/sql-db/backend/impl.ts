import * as ImplBetterSqlite3 from '../impl-better-sqlite3/impl-better-sqlite3'
import * as ImplNoop from '../impl-noop'
import * as ImplPostgres from '../impl-postgres'
import * as ImplPowerSync from '../impl-powersync-client'
import type { ISqlDb } from '../interface'

export type Config = ImplPostgres.Config | ImplNoop.Config | ImplPowerSync.Config | ImplBetterSqlite3.Config

export const SqlDb = async (config: Config): Promise<ISqlDb> => {
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
    case 'powersync-client': {
      return ImplPowerSync.SqlDb(config)
    }
  }
}
