import * as ImplHashMap from './impl-hash-map'
import * as ImplSqlDb from './impl-sql-db'
import type { IPuzzleDb } from './interface'

export type Config = ImplHashMap.Config | ImplSqlDb.Config

export const PuzzleDb = (config: Config): IPuzzleDb => {
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.PuzzleDb(config)
    }
    case 'sql-db': {
      return ImplSqlDb.PuzzleDb(config)
    }
  }
}
