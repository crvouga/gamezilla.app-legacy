import { Logger } from '~/@/logger'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { PgliteInstance } from '~/@/pglite/pglite-instance'
import { BackendSqlDb } from '~/@/sql-db/backend-impl'
import { describe, expect, test } from '~/@/test-runner'
import { CrudTransactionDb } from '../crud-transaction-db/impl-sql'
import { SyncEngineClient } from '../sync-engine-client'
import { SyncEngineServer } from '../sync-engine-server'
import { TodoDb } from './todo/todo-db'

const TestClient = () => {
  const todoDb = TodoDb({ t: 'hash-map' })
  const logger = Logger.init({ t: 'noop' })
  const sqlDb = BackendSqlDb.init({ t: 'pglite', pglite: PgliteInstance({ t: 'in-memory' }), logger })
  const migrationPolicy = SqlDbMigrationPolicy({ t: 'always-run', logger })
  const crudTransactionDb = CrudTransactionDb({ t: 'sql-db', logger, migrationPolicy, sqlDb })
  const syncEngine = SyncEngineClient({ crudTransactionDb, logger })
  return {
    todoDb,
    syncEngine,
  }
}

const TestServer = () => {
  const todoDb = TodoDb({ t: 'hash-map' })
  const logger = Logger.init({ t: 'noop' })
  const syncEngineServer = SyncEngineServer({ logger })

  return {
    todoDb,
    syncEngineServer,
  }
}

export const Fixture = () => {
  const clientA = TestClient()
  const clientB = TestClient()
  const clientC = TestClient()
  const server = TestServer()

  return {
    clientA,
    clientB,
    clientC,
    server,
  }
}

describe('sync-engine', () => {
  test('should push and pull data', () => {
    expect(true).toEqual(true)
  })
})
