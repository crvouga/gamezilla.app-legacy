import * as ImplNoop from '../impl-noop'
import * as ImplPgLite from '../impl-pglite'
import * as ImplPowerSync from '../impl-powersync'
import type { IDbConnSql } from '../interface'

export type Config = ImplNoop.Config | ImplPgLite.Config | ImplPowerSync.Config

export const DbConnSql = async (config: Config): Promise<IDbConnSql> => {
  switch (config.t) {
    case 'noop': {
      return ImplNoop.DbConnSql(config)
    }
    case 'pglite': {
      return ImplPgLite.DbConnSql(config)
    }
    case 'powersync': {
      return ImplPowerSync.DbConnSql(config)
    }
  }
}
