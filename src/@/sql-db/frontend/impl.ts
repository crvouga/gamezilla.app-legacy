import * as ImplNoop from '../impl-noop'
// import type * as ImplPgLite from '../impl-pglite'
import * as ImplPowerSync from '../impl-powersync-client'
import type { ISqlDb } from '../interface'

export type Config =
  | ImplNoop.Config
  // | ImplPgLite.Config
  | ImplPowerSync.Config

export const SqlDb = async (config: Config): Promise<ISqlDb> => {
  switch (config.t) {
    case 'noop': {
      return ImplNoop.SqlDb(config)
    }
    // case 'pglite': {
    //   const ImplPgLite = await import('../impl-pglite')
    //   return ImplPgLite.SqlDb(config)
    // }
    case 'powersync-client': {
      return ImplPowerSync.SqlDb(config)
    }
  }
}
