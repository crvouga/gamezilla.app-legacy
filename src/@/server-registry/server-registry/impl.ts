import { ImplFetch } from '../impl-fetch'
import { ImplMain } from '../impl-main'
import { ImplSqlDb } from './impl-sql-db'
import { IServerRegistry } from './interface'

export type ServerRegistry = ImplSqlDb | ImplFetch | ImplMain

const init = (self: ServerRegistry): IServerRegistry => {
  switch (self.t) {
    case 'sql-db':
      return ImplSqlDb.init(self)
    case 'fetch':
      return ImplFetch.init(self)
    case 'main':
      return ImplMain.init(self)
  }
}

export const ServerRegistry = {
  init,
}
