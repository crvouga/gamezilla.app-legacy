import * as ImplNoop from '../impl-noop'
import * as ImplPowerSync from '../impl-powersync-client'
import type { ISqlDb } from '../interface'

export type Config = ImplNoop.Config | ImplPowerSync.Config

export const SqlDb = async (config: Config): Promise<ISqlDb> => {
  switch (config.t) {
    case 'noop': {
      return ImplNoop.SqlDb(config)
    }
    case 'powersync-client': {
      return ImplPowerSync.SqlDb(config)
    }
  }
}
