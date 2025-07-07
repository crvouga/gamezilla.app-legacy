import * as ImplNoop from '../impl-noop'
import * as ImplPglite from '../impl-pglite'
import type { ISqlDb } from '../interface'

export type Config = ImplNoop.Config | ImplPglite.Config

export const SqlDb = async (config: Config): Promise<ISqlDb> => {
  switch (config.t) {
    case 'noop': {
      return ImplNoop.SqlDb(config)
    }

    case 'pglite': {
      return ImplPglite.SqlDb(config)
    }
  }
}
