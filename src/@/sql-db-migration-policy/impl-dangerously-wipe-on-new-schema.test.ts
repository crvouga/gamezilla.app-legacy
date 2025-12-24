import { KeyValueDb } from '~/@/key-value-db'
import { Logger } from '~/@/logger'
import { unwrap } from '~/@/result'
import { s } from '~/@/schema'
import { ImplBetterSqlite3 } from '~/@/sql-db/impl-better-sqlite3'
import { ImplNoop } from '~/@/sql-db/impl-noop'
import { IMigratableSqlDb, ISqlDb } from '~/@/sql-db/interface'
import { describe, expect, test } from '~/@/test-runner'
import { FileSystem } from '../file-system'
import { SqlDbMigrationPolicy } from './impl'

const Fixture = async () => {
  const logger = Logger.init({ t: 'noop' })
  const sqlDb: IMigratableSqlDb = ImplBetterSqlite3.init({
    t: 'better-sqlite3',
    databasePath: ':memory:',
    logger,
    fs: FileSystem.init({ t: 'in-memory' }),
  })
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

const FixtureWithNonMigratableDb = async () => {
  const logger = Logger.init({ t: 'noop' })
  const sqlDb: ISqlDb = ImplNoop.init({
    t: 'noop',
    logger,
  })
  const kvDb = KeyValueDb.init({ t: 'in-memory', logger })
  const migrationPolicy = SqlDbMigrationPolicy.init({
    t: 'dangerously-wipe-on-new-schema',
    kvDb,
    logger,
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

    const result = await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up,
      down,
    })

    // Verify result indicates migration was executed
    expect(result).toEqual({ t: 'executed' })

    const queryResult = await f.sqlDb.query({
      sql: `SELECT * FROM ${TABLE_NAME}`,
      schema: s.unknown,
      vars: {},
    })

    expect(unwrap(queryResult)).toBeTruthy()
  })

  test('should skip migration when schema has not changed', async () => {
    const f = await Fixture()
    const up = [`CREATE TABLE ${TABLE_NAME} (id TEXT)`]
    const down = [`DROP TABLE ${TABLE_NAME}`]

    // First run
    const firstResult = await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up,
      down,
    })
    expect(firstResult).toEqual({ t: 'executed' })

    // Second run with same schema
    const secondResult = await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up,
      down,
    })
    expect(secondResult).toEqual({ t: 'skipped', reason: 'schema-unchanged' })

    // Verify table still exists
    const queryResult = await f.sqlDb.query({
      sql: `SELECT * FROM ${TABLE_NAME}`,
      schema: s.unknown,
      vars: {},
    })

    expect(unwrap(queryResult)).toBeTruthy()
  })

  test('should run down and up migrations when schema has changed', async () => {
    const f = await Fixture()
    const initialUp = [`CREATE TABLE ${TABLE_NAME} (id TEXT)`]
    const initialDown = [`DROP TABLE ${TABLE_NAME}`]

    // First run
    const firstResult = await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up: initialUp,
      down: initialDown,
    })
    expect(firstResult).toEqual({ t: 'executed' })

    // Second run with modified schema
    const modifiedUp = [`CREATE TABLE ${TABLE_NAME} (id TEXT, name TEXT)`]
    const modifiedDown = [`DROP TABLE ${TABLE_NAME}`]

    const secondResult = await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up: modifiedUp,
      down: modifiedDown,
    })
    expect(secondResult).toEqual({ t: 'executed' })

    // Verify table exists with new schema
    const queryResult = await f.sqlDb.query({
      sql: `SELECT * FROM ${TABLE_NAME}`,
      schema: s.unknown,
      vars: {},
    })

    expect(unwrap(queryResult)).toBeTruthy()
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

    const result = await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up,
      down,
    })
    expect(result).toEqual({ t: 'executed' })

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

  test('should skip migration and log error when database is not migratable', async () => {
    const f = await FixtureWithNonMigratableDb()
    const up = [`CREATE TABLE ${TABLE_NAME} (id TEXT)`]
    const down = [`DROP TABLE ${TABLE_NAME}`]

    // Should not throw, just return skipped result
    const result = await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up,
      down,
    })

    // Verify result indicates migration was skipped
    expect(result).toEqual({ t: 'skipped', reason: 'non-migratable-database' })

    // Verify migration did not run - table should not exist
    // Since we're using ImplNoop, queries will return empty arrays, but the key point
    // is that the migration policy returned early without executing SQL
    const queryResult = await f.sqlDb.query({
      sql: `SELECT * FROM ${TABLE_NAME}`,
      schema: s.unknown,
      vars: {},
    })

    // With noop DB, this will return empty array, but importantly the migration didn't run
    expect(unwrap(queryResult)).toEqual([])
  })

  test('should skip migration when non-migratable database is used, even with multiple migrations', async () => {
    const f = await FixtureWithNonMigratableDb()
    const up = [`CREATE TABLE ${TABLE_NAME} (id TEXT)`, `CREATE TABLE ${TABLE_NAME_2} (id TEXT, name TEXT)`]
    const down = [`DROP TABLE ${TABLE_NAME}`, `DROP TABLE ${TABLE_NAME_2}`]

    // Should not throw, just return skipped result
    const firstResult = await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up,
      down,
    })

    // Verify result indicates migration was skipped
    expect(firstResult).toEqual({ t: 'skipped', reason: 'non-migratable-database' })

    // Second call should also return skipped
    const secondResult = await f.migrationPolicy.execute({
      logger: f.logger,
      sqlDb: f.sqlDb,
      up,
      down,
    })

    // Should return skipped again on second call
    expect(secondResult).toEqual({ t: 'skipped', reason: 'non-migratable-database' })
  })
})
