import { ImplFetch } from './impl-fetch'
import { ImplMain } from './impl-main'
import { ImplSqlDb } from './impl-sql-db'
import { IServerRegistry } from './interface'

export type ServerRegistry = ImplSqlDb | ImplFetch | ImplMain

const init = (self: ServerRegistry): IServerRegistry => {
  const logger = self.logger.child(['server-registry'])
  switch (self.t) {
    case 'sql-db':
      return ImplSqlDb.init({ ...self, logger })
    case 'fetch':
      return ImplFetch.init({ ...self, logger })
    case 'main':
      return ImplMain.init({ ...self, logger })
  }
}

export const ServerRegistry = {
  init,
}
