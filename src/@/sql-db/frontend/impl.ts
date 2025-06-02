import * as ImplNoop from '../impl-noop'
// import type * as ImplPgLite from '../impl-pglite'
import * as ImplPowerSync from '../impl-powersync-client'
import type { ISqlDb } from '../interface'

export type Config =
  | ImplNoop.Config
  // | ImplPgLite.Config
  | ImplPowerSync.Config

export const DbConnSql = async (config: Config): Promise<ISqlDb> => {
  switch (config.t) {
    case 'noop': {
      return ImplNoop.DbConnSql(config)
    }
    // case 'pglite': {
    //   const ImplPgLite = await import('../impl-pglite')
    //   return ImplPgLite.DbConnSql(config)
    // }
    case 'powersync-client': {
      return ImplPowerSync.DbConnSql(config)
    }
  }
}
