import { ILogger } from '~/@/logger'
import { isErr, Ok } from '~/@/result'
import { s } from '~/@/schema'
import { Sql } from '~/@/sql'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import { ISqlDb } from '~/@/sql-db/interface'
import { CrudTransaction } from '../crud-transaction/crud-transaction'
import { CrudTransactionEntry } from '../crud-transaction/crud-transaction-entry'
import { CrudTransactionEntryOp } from '../crud-transaction/crud-transaction-entry-op'
import { ICrudTransactionDb } from './interface'

export type ImplSqlDb = {
  t: 'sql-db'
  sqlDb: ISqlDb
  migrationPolicy: ISqlDbMigrationPolicy
  logger: ILogger
}

const CrudTransactionRow = s.obj({
  id: s.str(),
  created_at_unix_ms: s.num(),
  session_id: s.str(),
  client_session_id: s.str(),
  committed: s.bool,
  committed_at_unix_ms: s.num(),
})

const CrudTransactionEntryRow = s.obj({
  id: s.str(),
  crud_transaction_id: s.str(),
  op: s.enumeration(['create', 'update', 'delete']),
  new_data_json: s.str(),
  prev_data_json: s.str(),
  created_at_unix_ms: s.num(),
  entry_id: s.str(),
  collection: s.str(),
})

const UP = [
  `
CREATE TABLE IF NOT EXISTS crud_transaction (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    client_session_id TEXT NOT NULL,
    committed BOOLEAN NOT NULL DEFAULT FALSE,
    committed_at_unix_ms BIGINT,
    created_at_unix_ms BIGINT NOT NULL
  )`,
  `
CREATE TABLE IF NOT EXISTS crud_transaction_entry (
    id TEXT PRIMARY KEY,
    crud_transaction_id TEXT NOT NULL,
    op TEXT NOT NULL,
    new_data_json TEXT NOT NULL,
    prev_data_json TEXT,
    collection TEXT NOT NULL
  )`,
]

const DOWN = [`DROP TABLE IF EXISTS crud_transaction_entry`, `DROP TABLE IF EXISTS crud_transaction`]

const init = (config: ImplSqlDb): ICrudTransactionDb => {
  const logger = config.logger.child(['crud-transaction-db'])
  config.migrationPolicy.execute({
    logger,
    up: UP,
    down: DOWN,
    sqlDb: config.sqlDb,
  })

  return {
    async uncommitted() {
      const queriedTransactions = await config.sqlDb.query({
        sql: `SELECT * FROM crud_transaction WHERE committed = FALSE LIMIT 100`,
        schema: CrudTransactionRow,
        vars: {},
      })

      if (isErr(queriedTransactions)) return queriedTransactions

      const queriedEntries = await config.sqlDb.query({
        sql: `SELECT * FROM crud_transaction_entry WHERE crud_transaction_id IN (:ids) ORDER BY created_at_unix_ms ASC`,
        schema: CrudTransactionEntryRow,
        vars: {
          ids: Sql.commas(queriedTransactions.value.map((t) => t.id)),
        },
      })

      if (isErr(queriedEntries)) return queriedEntries

      const result: CrudTransaction[] = queriedTransactions.value.map((t) => ({
        id: t.id,
        sessionId: t.session_id,
        clientSessionId: t.client_session_id,
        committed: t.committed,
        committedAtUnixMs: t.committed_at_unix_ms,
        entries: queriedEntries.value
          .filter((e) => e.crud_transaction_id === t.id)
          .map(
            (e): CrudTransactionEntry => ({
              op: e.op as CrudTransactionEntryOp,
              id: e.id,
              collection: e.collection,
              newData: e.new_data_json ? JSON.parse(e.new_data_json) : null,
              prevData: e.prev_data_json ? JSON.parse(e.prev_data_json) : null,
            }),
          ),
      }))

      return Ok(result)
    },
    async push(crudTransaction) {
      const now = Date.now()

      // Insert transaction
      const insertTransaction = await config.sqlDb.query({
        sql: `
            INSERT INTO crud_transaction (
              id, created_at_unix_ms, session_id, client_session_id, 
              committed, committed_at_unix_ms
            )
            VALUES (
              :id, :created_at_unix_ms, :session_id, :client_session_id,
              :committed, :committed_at_unix_ms
            )`,
        schema: s.unknown,
        vars: {
          id: crudTransaction.id,
          created_at_unix_ms: now,
          session_id: crudTransaction.sessionId,
          client_session_id: crudTransaction.clientSessionId,
          committed: crudTransaction.committed,
          committed_at_unix_ms: crudTransaction.committed ? now : null,
        },
      })

      if (isErr(insertTransaction)) return insertTransaction

      // Insert entries
      for (const entry of crudTransaction.entries) {
        const insertEntry = await config.sqlDb.query({
          sql: `
              INSERT INTO crud_transaction_entry (
                id, crud_transaction_id, op, new_data_json,
                prev_data_json, collection, created_at_unix_ms
              )
              VALUES (
                :id, :crud_transaction_id, :op, :new_data_json,
                :prev_data_json, :collection, :created_at_unix_ms
              )`,
          schema: s.unknown,
          vars: {
            id: entry.id,
            crud_transaction_id: crudTransaction.id,
            op: entry.op,
            new_data_json: entry.newData ? JSON.stringify(entry.newData) : null,
            prev_data_json: entry.prevData ? JSON.stringify(entry.prevData) : null,
            collection: entry.collection,
            created_at_unix_ms: now,
          },
        })

        if (isErr(insertEntry)) return insertEntry
      }

      return Ok(null)
    },
    async commit(crudTransaction) {
      const updateTransaction = await config.sqlDb.query({
        sql: `UPDATE crud_transaction SET committed = TRUE, committed_at_unix_ms = :committed_at_unix_ms WHERE id = :id`,
        schema: s.unknown,
        vars: {
          id: crudTransaction.id,
          committed_at_unix_ms: Date.now(),
        },
      })

      if (isErr(updateTransaction)) return updateTransaction

      return Ok(null)
    },
  }
}

export const ImplSqlDb = {
  init,
}
