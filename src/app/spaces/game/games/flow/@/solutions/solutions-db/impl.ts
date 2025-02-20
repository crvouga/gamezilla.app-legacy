import * as ImplDbConnSql from './impl-db-conn-sql'
import * as ImplKeyValueDb from './impl-key-value-db'
import { ISolutionsDb } from './interface'
import * as ImplWithSqlTables from './with-sql-tables'

export type Config = ImplKeyValueDb.Config | ImplDbConnSql.Config | ImplWithSqlTables.Config

export const SolutionsDb = (config: Config): ISolutionsDb => {
  switch (config.t) {
    case 'key-value-db': {
      return ImplKeyValueDb.SolutionsDb(config)
    }
    case 'db-conn-sql': {
      return ImplDbConnSql.SolutionsDb(config)
    }
    case 'with-sql-tables': {
      return ImplWithSqlTables.SolutionsDb(config)
    }
  }
}
