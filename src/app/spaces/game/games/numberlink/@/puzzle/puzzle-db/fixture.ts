import { Logger } from '~/@/logger'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { PuzzleDb } from './impl'

const BaseFixture = (config: PuzzleDb) => {
  const puzzleDb = PuzzleDb.init(config)
  return {
    puzzleDb,
  }
}

export const BaseFixtures = async () => {
  const f = await FixtureAppBackend()

  const configs: PuzzleDb[] = []

  configs.push({
    t: 'hash-map',
  })

  const logger = Logger.init({ t: 'noop' })

  configs.push({
    t: 'sql-db',
    sqlDb: f.sqlDbSqlite,
    logger,
    migrationPolicy: SqlDbMigrationPolicy.init({ t: 'always-run', logger }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql-db',
      sqlDb: f.sqlDbPostgres,
      logger,
      migrationPolicy: SqlDbMigrationPolicy.init({ t: 'always-run', logger }),
    })
  }

  return Promise.all(configs.map(BaseFixture))
}
