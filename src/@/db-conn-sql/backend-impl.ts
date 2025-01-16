import * as ImplPostgres from './impl-postgres'
import * as ImplNoop from './impl-noop'
import * as ImplPgLite from './impl-pglite'
import * as ImplPowersync from './impl-powersync'
import type { IDbConnSql } from './interface'

export type Config = ImplPostgres.Config | ImplNoop.Config | ImplPgLite.Config | ImplPowersync.Config

export const DbConnSql = async (config: Config): Promise<IDbConnSql> => {
  switch (config.t) {
    case 'noop': {
      return ImplNoop.DbConnSql(config)
    }
    case 'postgres': {
      return ImplPostgres.DbConnSql(config)
    }
    case 'pglite': {
      return ImplPgLite.DbConnSql(config)
    }
    case 'powersync': {
      return ImplPowersync.DbConnSql(config)
    }
  }
}
