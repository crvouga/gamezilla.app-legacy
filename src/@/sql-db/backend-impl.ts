import { ImplBetterSqlite3 } from './impl-better-sqlite3'
import { ImplNoop } from './impl-noop'
import { ImplPglite } from './impl-pglite'
import { ImplPostgres } from './impl-postgres'
import { assertNotMigratable, type ISqlDb } from './interface'

export type BackendSqlDb = ImplPostgres | ImplNoop | ImplBetterSqlite3 | ImplPglite

const init = (config: BackendSqlDb): ISqlDb => {
  const logger = config.logger.child(['sql-db'])
  switch (config.t) {
    case 'noop':
      return ImplNoop.init({ ...config, logger })
    case 'postgres': {
      const sqlDb = ImplPostgres.init({ ...config, logger })
      // CRITICAL BACKUP CHECK: Ensure Postgres databases are NEVER migratable.
      // This is a defensive assertion at the backend entry point to catch any
      // accidental modifications that might make Postgres migratable.
      assertNotMigratable(sqlDb, 'the Postgres implementation')
      return sqlDb
    }
    case 'better-sqlite3':
      return ImplBetterSqlite3.init({ ...config, logger })
    case 'pglite':
      return ImplPglite.init({ ...config, logger })
  }
}

export const BackendSqlDb = {
  init,
}
