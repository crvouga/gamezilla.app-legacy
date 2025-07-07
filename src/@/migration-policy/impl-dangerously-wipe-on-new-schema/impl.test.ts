import { KeyValueDb } from '~/@/key-value-db'
import { Logger } from '~/@/logger'
import { PgliteInstance } from '~/@/pglite/pglite-instance'
import { unwrap } from '~/@/result'
import { s } from '~/@/schema'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { describe, expect, test } from '~/@/test-runner'
import { MigrationPolicy } from './impl'

const Fixture = async () => {
  const logger = Logger({ t: 'noop' })
  const pglite = PgliteInstance({ t: 'in-memory' })
  const sqlDb = SqlDb({ t: 'pglite', pglite, logger })
  const kvDb = KeyValueDb({ t: 'sql-db', sqlDb, logger })
  const migrationPolicy = MigrationPolicy({
    t: 'dangerously-wipe-on-new-schema',
    kvDb,
    logger: Logger({ t: 'noop' }),
  })
  return {
    sqlDb,
    kvDb,
    migrationPolicy,
  }
}

describe('MigrationPolicy DangerouslyWipeOnNewSchema', () => {
  test('should run up migration when no previous schema exists', async () => {
    const f = await Fixture()
    const up = ['CREATE TABLE test (id TEXT)']
    const down = ['DROP TABLE test']

    await f.migrationPolicy.execute({
      sqlDb: f.sqlDb,
      up,
      down,
    })

    const result = await f.sqlDb.query({
      sql: 'SELECT * FROM test',
      schema: s.unknown,
      vars: {},
    })

    expect(unwrap(result)).toBeTruthy()
  })

  test('should skip migration when schema has not changed', async () => {
    const f = await Fixture()
    const up = ['CREATE TABLE test (id TEXT)']
    const down = ['DROP TABLE test']

    // First run
    await f.migrationPolicy.execute({
      sqlDb: f.sqlDb,
      up,
      down,
    })

    // Second run with same schema
    await f.migrationPolicy.execute({
      sqlDb: f.sqlDb,
      up,
      down,
    })

    // Verify table still exists
    const result = await f.sqlDb.query({
      sql: 'SELECT * FROM test',
      schema: s.unknown,
      vars: {},
    })

    expect(unwrap(result)).toBeTruthy()
  })

  test('should run down and up migrations when schema has changed', async () => {
    const f = await Fixture()
    const initialUp = ['CREATE TABLE test (id TEXT)']
    const initialDown = ['DROP TABLE test']

    // First run
    await f.migrationPolicy.execute({
      sqlDb: f.sqlDb,
      up: initialUp,
      down: initialDown,
    })

    // Second run with modified schema
    const modifiedUp = ['CREATE TABLE test (id TEXT, name TEXT)']
    const modifiedDown = ['DROP TABLE test']

    await f.migrationPolicy.execute({
      sqlDb: f.sqlDb,
      up: modifiedUp,
      down: modifiedDown,
    })

    // Verify table exists with new schema
    const result = await f.sqlDb.query({
      sql: 'SELECT * FROM test',
      schema: s.unknown,
      vars: {},
    })

    expect(unwrap(result)).toBeTruthy()
  })

  test('should run up migration when a previous schema exists but its not within the key value db', async () => {
    const f = await Fixture()

    unwrap(
      await f.sqlDb.query({
        sql: 'CREATE TABLE my_test_test (id TEXT)',
        schema: s.unknown,
        vars: {},
      }),
    )

    const up = ['CREATE TABLE IF NOT EXISTS my_test_test (id TEXT, foo TEXT)']
    const down = ['DROP TABLE IF EXISTS my_test_test']

    await f.migrationPolicy.execute({
      sqlDb: f.sqlDb,
      up,
      down,
    })

    await f.sqlDb.query({
      sql: 'INSERT INTO my_test_test (id, foo) VALUES (:id, :foo)',
      schema: s.unknown,
      vars: { id: '1', foo: 'bar' },
    })

    unwrap(
      await f.sqlDb.query({
        sql: 'SELECT id, foo FROM my_test_test',
        schema: s.unknown,
        vars: {},
      }),
    )
  })
})
