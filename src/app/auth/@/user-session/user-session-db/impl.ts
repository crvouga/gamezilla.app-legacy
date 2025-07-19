import * as ImplInMemory from './impl-in-memory'
import * as ImplSql from './impl-sql'
import * as ImplSqlWithCache from './impl-sql-with-cache'
import type { IUserSessionDb } from './interface'

export type Config = ImplInMemory.Config | ImplSql.Config | ImplSqlWithCache.Config

export const UserSessionDb = async (config: Config): Promise<IUserSessionDb> => {
  const logger = config.logger.child(['user-session-db'])

  switch (config.t) {
    case 'in-memory': {
      return ImplInMemory.UserSessionDb({ ...config, logger })
    }

    case 'sql': {
      return ImplSql.UserSessionDb({ ...config, logger })
    }

    case 'sql-with-cache': {
      return ImplSqlWithCache.UserSessionDb({ ...config, logger })
    }
  }
}
