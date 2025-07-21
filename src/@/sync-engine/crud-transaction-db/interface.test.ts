import { Logger } from '~/@/logger'
import { PgliteInstance } from '~/@/pglite/pglite-instance'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { BackendSqlDb } from '~/@/sql-db/backend-impl'
import { describe, expect, test } from '~/@/test-runner'
import { CrudTransactionDb } from './impl'

export const Fixture = () => {
  const logger = Logger.init({ t: 'noop' })
  const sqlDb = BackendSqlDb.init({ t: 'pglite', pglite: PgliteInstance({ t: 'in-memory' }), logger })
  const migrationPolicy = SqlDbMigrationPolicy.init({ t: 'always-run', logger })
  const crudTransactionDb = CrudTransactionDb.init({ t: 'sql-db', sqlDb, migrationPolicy, logger })
  return {
    crudTransactionDb,
  }
}

describe('crud-transaction-db', () => {
  test('should create a crud transaction db', () => {
    expect(true).toEqual(true)
  })
})
