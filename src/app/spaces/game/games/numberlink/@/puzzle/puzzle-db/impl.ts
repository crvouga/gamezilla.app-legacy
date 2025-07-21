import { ImplHashMap } from './impl-hash-map'
import { ImplSqlDb } from './impl-sql-db'
import type { IPuzzleDb } from './interface'

export type PuzzleDb = ImplHashMap | ImplSqlDb

const init = (config: PuzzleDb): IPuzzleDb => {
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.init(config)
    }
    case 'sql-db': {
      return ImplSqlDb.init(config)
    }
  }
}

export const PuzzleDb = {
  init,
}
