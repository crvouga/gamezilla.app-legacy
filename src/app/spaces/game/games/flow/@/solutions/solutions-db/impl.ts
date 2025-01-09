import { ISolutionsDb } from './interface'
import * as ImplDbConnKv from './impl-db-conn-kv'

export type Config = ImplDbConnKv.Config

export const SolutionsDb = (config: Config): ISolutionsDb => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.SolutionsDb(config)
    }
  }
}
