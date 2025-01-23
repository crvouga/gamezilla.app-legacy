import * as ImplHashMap from './impl-hash-map'
import * as ImplDbConnSql from './impl-db-conn-sql'
import type { IPuzzleDb } from './interface'
import * as ImplWithSqlTables from './with-sql-tables'

export type Config = ImplHashMap.Config | ImplDbConnSql.Config | ImplWithSqlTables.Config

export const PuzzleDb = (config: Config): IPuzzleDb => {
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.PuzzleDb(config)
    }
    case 'db-conn-sql': {
      return ImplDbConnSql.PuzzleDb(config)
    }
    case 'with-sql-tables': {
      return ImplWithSqlTables.PuzzleDb(config)
    }
  }
}
