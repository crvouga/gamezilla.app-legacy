import { ImplKeyValueDb } from './impl-key-value-db'
import { ImplSqlDb } from './impl-sql-db'
import { ISolutionsDb } from './interface'

export type SolutionsDb = ImplKeyValueDb | ImplSqlDb

const init = (config: SolutionsDb): ISolutionsDb => {
  switch (config.t) {
    case 'key-value-db': {
      return ImplKeyValueDb.init(config)
    }
    case 'sql-db': {
      return ImplSqlDb.init(config)
    }
  }
}

export const SolutionsDb = {
  init,
}
