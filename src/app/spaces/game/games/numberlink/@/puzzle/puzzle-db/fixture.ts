import { Logger } from '~/@/logger'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { Config, PuzzleDb } from './impl'

const BaseFixture = (config: Config) => {
  const puzzleDb = PuzzleDb(config)
  return {
    puzzleDb,
  }
}

export const BaseFixtures = async () => {
  const f = await FixtureAppBackend()

  const configs: Config[] = []

  configs.push({
    t: 'hash-map',
  })

  configs.push({
    t: 'sql-db',
    sqlDb: f.sqlDbSqlite,
    logger: Logger({ t: 'noop' }),
    migrationPolicy: SqlDbMigrationPolicy({ t: 'always-run', logger: Logger({ t: 'noop' }) }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql-db',
      sqlDb: f.sqlDbPostgres,
      logger: Logger({ t: 'noop' }),
      migrationPolicy: SqlDbMigrationPolicy({ t: 'always-run', logger: Logger({ t: 'noop' }) }),
    })
  }

  return Promise.all(configs.map(BaseFixture))
}
