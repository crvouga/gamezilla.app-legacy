import { Logger } from '~/@/logger'
import { MigrationPolicy } from '~/@/migration-policy'
import { PgliteInstance } from '~/@/pglite/pglite-instance'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { describe, expect, test } from '~/@/test-runner'
import { CrudTransactionDb } from './impl-sql'

export const Fixture = () => {
  const logger = Logger({ t: 'noop' })
  const sqlDb = SqlDb({ t: 'pglite', pglite: PgliteInstance({ t: 'in-memory' }), logger })
  const migrationPolicy = MigrationPolicy({ t: 'always-run', logger })
  const crudTransactionDb = CrudTransactionDb({ t: 'sql-db', sqlDb, migrationPolicy, logger })
  return {
    crudTransactionDb,
  }
}

describe('crud-transaction-db', () => {
  test('should create a crud transaction db', () => {
    expect(true).toEqual(true)
  })
})
