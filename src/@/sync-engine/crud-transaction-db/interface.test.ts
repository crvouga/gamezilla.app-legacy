import { Logger } from '~/@/logger'
import { MigrationPolicy } from '~/@/migration-policy'
import { PgliteInstance } from '~/@/pglite/pglite-instance'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { CrudTransactionDb } from './impl-sql'

export const Fixture = () => {
  const crudTransactionDb = CrudTransactionDb({
    t: 'sql-db',
    sqlDb: SqlDb({ t: 'pglite', pglite: PgliteInstance({ t: 'in-memory' }), logger: Logger({ t: 'noop' }) }),
    migrationPolicy: MigrationPolicy({ t: 'always-run', logger: Logger({ t: 'noop' }) }),
    logger: Logger({ t: 'noop' }),
  })
  return {
    crudTransactionDb,
  }
}
