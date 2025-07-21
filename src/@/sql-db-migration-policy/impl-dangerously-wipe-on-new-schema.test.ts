import { KeyValueDb } from '~/@/key-value-db'
import { Logger } from '~/@/logger'
import { PgliteInstance } from '~/@/pglite/pglite-instance'
import { unwrap } from '~/@/result'
import { s } from '~/@/schema'
import { BackendSqlDb } from '~/@/sql-db/backend-impl'
import { describe, expect, test } from '~/@/test-runner'
import { SqlDbMigrationPolicy } from './impl'

const Fixture = async () => {
  const logger = Logger.init({ t: 'noop' })
  const pglite = PgliteInstance({ t: 'in-memory' })
  const sqlDb = BackendSqlDb.init({ t: 'pglite', pglite, logger })
  const kvDb = KeyValueDb.init({ t: 'in-memory', logger })
  const migrationPolicy = SqlDbMigrationPolicy.init({
    t: 'dangerously-wipe-on-new-schema',
    kvDb,
    logger: Logger.init({ t: 'noop' }),
  })
  return {
    sqlDb,
    kvDb,
    migrationPolicy,
    logger,
  }
}

const TABLE_NAME = 'test_dangerously_wipe_on_new_schema'
const TABLE_NAME_2 = 'test_dangerously_wipe_on_new_schema_2'

describe('SqlDbMigrationPolicy DangerouslyWipeOnNewSchema', () => {
  test('should run up migration when no previous schema exists', async () => {
    const f = await Fixture()
    const up = [`CREATE TABLE ${TABLE_NAME} (id TEXT)`]
    const down = [`DROP TABLE ${TABLE_NAME}`]

    await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up,
      down,
    })

    const result = await f.sqlDb.query({
      sql: `SELECT * FROM ${TABLE_NAME}`,
      schema: s.unknown,
      vars: {},
    })

    expect(unwrap(result)).toBeTruthy()
  })

  test('should skip migration when schema has not changed', async () => {
    const f = await Fixture()
    const up = [`CREATE TABLE ${TABLE_NAME} (id TEXT)`]
    const down = [`DROP TABLE ${TABLE_NAME}`]

    // First run
    await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up,
      down,
    })

    // Second run with same schema
    await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up,
      down,
    })

    // Verify table still exists
    const result = await f.sqlDb.query({
      sql: `SELECT * FROM ${TABLE_NAME}`,
      schema: s.unknown,
      vars: {},
    })

    expect(unwrap(result)).toBeTruthy()
  })

  test('should run down and up migrations when schema has changed', async () => {
    const f = await Fixture()
    const initialUp = [`CREATE TABLE ${TABLE_NAME} (id TEXT)`]
    const initialDown = [`DROP TABLE ${TABLE_NAME}`]

    // First run
    await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up: initialUp,
      down: initialDown,
    })

    // Second run with modified schema
    const modifiedUp = [`CREATE TABLE ${TABLE_NAME} (id TEXT, name TEXT)`]
    const modifiedDown = [`DROP TABLE ${TABLE_NAME}`]

    await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up: modifiedUp,
      down: modifiedDown,
    })

    // Verify table exists with new schema
    const result = await f.sqlDb.query({
      sql: `SELECT * FROM ${TABLE_NAME}`,
      schema: s.unknown,
      vars: {},
    })

    expect(unwrap(result)).toBeTruthy()
  })

  test('should run up migration when a previous schema exists but its not within the key value db', async () => {
    const f = await Fixture()

    unwrap(
      await f.sqlDb.query({
        sql: `CREATE TABLE ${TABLE_NAME} (id TEXT)`,
        schema: s.unknown,
        vars: {},
      }),
    )

    const up = [`CREATE TABLE IF NOT EXISTS ${TABLE_NAME_2} (id TEXT, foo TEXT)`]
    const down = [`DROP TABLE IF EXISTS ${TABLE_NAME_2}`]

    await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up,
      down,
    })

    await f.sqlDb.query({
      sql: `INSERT INTO ${TABLE_NAME_2} (id, foo) VALUES (:id, :foo)`,
      schema: s.unknown,
      vars: { id: '1', foo: 'bar' },
    })

    unwrap(
      await f.sqlDb.query({
        sql: `SELECT id, foo FROM ${TABLE_NAME_2}`,
        schema: s.unknown,
        vars: {},
      }),
    )
  })
})
