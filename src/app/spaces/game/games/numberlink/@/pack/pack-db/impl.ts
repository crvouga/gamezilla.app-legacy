import { ImplHashMap } from './impl-hash-map'
import { ImplSqlDb } from './impl-sql-db'
import type { IPackDb } from './interface'

export type PackDb = ImplHashMap | ImplSqlDb

const init = (config: PackDb): IPackDb => {
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.init(config)
    }
    case 'sql-db': {
      return ImplSqlDb.init(config)
    }
  }
}

export const PackDb = {
  init,
}
