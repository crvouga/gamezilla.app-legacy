import * as ImplKeyValueDb from './impl-key-value-db'
import * as ImplDbConnSql from './impl-db-conn-sql'
import { ISolutionsDb } from './interface'

export type Config = ImplKeyValueDb.Config | ImplDbConnSql.Config

export const SolutionsDb = (config: Config): ISolutionsDb => {
  switch (config.t) {
    case 'key-value-db': {
      return ImplKeyValueDb.SolutionsDb(config)
    }
    case 'db-conn-sql': {
      return ImplDbConnSql.SolutionsDb(config)
    }
  }
}
