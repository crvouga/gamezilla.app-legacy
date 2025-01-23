import * as ImplKeyValueDb from './impl-key-value-db'
import * as ImplPostgres from './impl-postgres'
import { ISolutionsDb } from './interface'

export type Config = ImplKeyValueDb.Config | ImplPostgres.Config

export const SolutionsDb = (config: Config): ISolutionsDb => {
  switch (config.t) {
    case 'key-value-db': {
      return ImplKeyValueDb.SolutionsDb(config)
    }
    case 'postgres': {
      return ImplPostgres.SolutionsDb(config)
    }
  }
}
