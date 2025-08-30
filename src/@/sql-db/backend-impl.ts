import { ImplBetterSqlite3 } from './impl-better-sqlite3'
import { ImplNoop } from './impl-noop'
import { ImplPglite } from './impl-pglite'
import { ImplPostgres } from './impl-postgres'
import type { ISqlDb } from './interface'

export type BackendSqlDb = ImplPostgres | ImplNoop | ImplBetterSqlite3 | ImplPglite

const init = (config: BackendSqlDb): ISqlDb => {
  switch (config.t) {
    case 'noop':
      return ImplNoop.init(config)
    case 'postgres':
      return ImplPostgres.init(config)
    case 'better-sqlite3':
      return ImplBetterSqlite3.init(config)
    case 'pglite':
      return ImplPglite.init(config)
  }
}

export const BackendSqlDb = {
  init,
}
