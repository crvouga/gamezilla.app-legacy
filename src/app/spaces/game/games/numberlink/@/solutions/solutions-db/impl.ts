import * as ImplSqlDb from './impl-sql-db'
import * as ImplKeyValueDb from './impl-key-value-db'
import { ISolutionsDb } from './interface'
import * as ImplWithSqlTables from './with-sql-tables'

export type Config = ImplKeyValueDb.Config | ImplSqlDb.Config | ImplWithSqlTables.Config

export const SolutionsDb = (config: Config): ISolutionsDb => {
  switch (config.t) {
    case 'key-value-db': {
      return ImplKeyValueDb.SolutionsDb(config)
    }
    case 'sql-db': {
      return ImplSqlDb.SolutionsDb(config)
    }
    case 'with-sql-tables': {
      return ImplWithSqlTables.SolutionsDb(config)
    }
  }
}
