import * as ImplHashMap from './impl-hash-map'
import * as ImplSql from './impl-sql'
import type { IPuzzleDb } from './interface'
import * as ImplWithEnsureTables from './with-sql-tables'

export type Config = ImplHashMap.Config | ImplSql.Config | ImplWithEnsureTables.Config

export const PuzzleDb = (config: Config): IPuzzleDb => {
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.PuzzleDb(config)
    }
    case 'db-conn-sql': {
      return ImplSql.PuzzleDb(config)
    }
    case 'with-sql-tables': {
      return ImplWithEnsureTables.PuzzleDb(config)
    }
  }
}
