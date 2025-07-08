import { Logger } from '~/@/logger'
import { MigrationPolicy } from '~/@/migration-policy'
import { PgliteInstance } from '~/@/pglite/pglite-instance'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { CrudTransactionDb } from '../crud-transaction-db/impl-sql'
import { SyncEngineClient } from '../sync-engine-client'
import { SyncEngineServer } from '../sync-engine-server'
import { TodoDb } from './todo/todo-db'

const TestClient = () => {
  const todoDb = TodoDb({ t: 'hash-map' })
  const logger = Logger({ t: 'noop' })
  const crudTransactionDb = CrudTransactionDb({
    t: 'sql-db',
    logger,
    migrationPolicy: MigrationPolicy({ t: 'always-run', logger }),
    sqlDb: SqlDb({ t: 'pglite', pglite: PgliteInstance({ t: 'in-memory' }), logger }),
  })
  const syncEngine = SyncEngineClient({ crudTransactionDb, logger })

  return {
    todoDb,
    syncEngine,
  }
}

const TestServer = () => {
  const todoDb = TodoDb({ t: 'hash-map' })
  const logger = Logger({ t: 'noop' })
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
