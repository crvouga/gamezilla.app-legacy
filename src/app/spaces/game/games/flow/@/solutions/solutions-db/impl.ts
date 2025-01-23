import * as ImplKeyValueDb from './impl-db-conn-kv'
import * as ImplPostgres from './impl-postgres'
import { ISolutionsDb } from './interface'

export type Config = ImplKeyValueDb.Config | ImplPostgres.Config

export const SolutionsDb = (config: Config): ISolutionsDb => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplKeyValueDb.SolutionsDb(config)
    }
    case 'postgres': {
      return ImplPostgres.SolutionsDb(config)
    }
  }
}
