import { ImplSqlDb } from './impl-sql-db'
import type { IUserSessionDb } from './interface'

export type UserSessionDb = ImplSqlDb

const init = async (config: UserSessionDb): Promise<IUserSessionDb> => {
  const logger = config.logger.child(['user-session-db'])

  switch (config.t) {
    case 'sql': {
      return ImplSqlDb.init({ ...config, logger })
    }
  }
}

export const UserSessionDb = {
  init,
}
