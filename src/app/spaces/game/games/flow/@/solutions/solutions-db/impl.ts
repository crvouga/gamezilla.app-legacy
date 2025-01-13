import * as ImplDbConnKv from './impl-db-conn-kv'
import * as ImplPostgres from './impl-postgres'
import { ISolutionsDb } from './interface'

export type Config = ImplDbConnKv.Config | ImplPostgres.Config

export const SolutionsDb = (config: Config): ISolutionsDb => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.SolutionsDb(config)
    }
    case 'postgres': {
      return ImplPostgres.SolutionsDb(config)
    }
  }
}
