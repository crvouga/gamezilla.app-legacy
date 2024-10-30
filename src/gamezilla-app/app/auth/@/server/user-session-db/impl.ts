import * as ImplInMemory from './impl-in-memory'
import * as ImplPostgres from './impl-postgres'
import * as ImplPostgresWithCache from './impl-postgres-with-cache'
import type { IUserSessionDb } from './interface'

export type Config = ImplInMemory.Config | ImplPostgres.Config | ImplPostgresWithCache.Config

export const UserSessionDb = async (config: Config): Promise<IUserSessionDb> => {
  switch (config.t) {
    case 'in-memory': {
      return ImplInMemory.UserSessionDb(config)
    }

    case 'postgres': {
      return ImplPostgres.UserSessionDb(config)
    }

    case 'postgres-with-cache': {
      return ImplPostgresWithCache.UserSessionDb(config)
    }
  }
}
