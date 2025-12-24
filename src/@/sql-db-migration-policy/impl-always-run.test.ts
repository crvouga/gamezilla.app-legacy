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
  const migrationPolicy = SqlDbMigrationPolicy.init({
    t: 'always-run',
    logger: Logger.init({ t: 'noop' }),
  })
  return {
    sqlDb,
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
  const migrationPolicy = SqlDbMigrationPolicy.init({
    t: 'always-run',
    logger,
  })
  return {
    sqlDb,
    migrationPolicy,
    logger,
  }
}

const TABLE_NAME = 'test_always_run'

describe('SqlDbMigrationPolicy AlwaysRun', () => {
  test('should run migration when database is migratable', async () => {
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
})
