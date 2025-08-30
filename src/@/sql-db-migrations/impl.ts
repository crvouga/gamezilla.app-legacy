import { ImplDbMate } from './impl-dbmate'
import { ISqlDbMigration } from './interface'

export type SqlDbMigration = ImplDbMate

const init = (config: ImplDbMate): ISqlDbMigration => {
  const logger = config.logger.child(['sql-db-migrations'])
  switch (config.t) {
    case 'dbmate':
      return ImplDbMate.init({ ...config, logger })
  }
}

export const SqlDbMigration = {
  init,
}
