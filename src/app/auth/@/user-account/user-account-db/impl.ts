import { ImplSqlDb } from './impl-sql-db'
import type { IUserAccountDb } from './interface'

export type UserAccountDb = ImplSqlDb

const init = async (config: UserAccountDb): Promise<IUserAccountDb> => {
  const logger = config.logger.child(['user-account-db'])

  switch (config.t) {
    case 'sql': {
      return ImplSqlDb.init({ ...config, logger })
    }
  }
}

export const UserAccountDb = {
  init,
}
