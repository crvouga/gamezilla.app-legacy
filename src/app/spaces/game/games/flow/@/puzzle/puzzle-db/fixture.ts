import { Logger } from '~/@/logger'
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
    t: 'with-sql-tables',
    dbConnSql: f.dbConnSqlite,
    puzzleDb: PuzzleDb({
      t: 'sql-db',
      dbConnSql: f.dbConnSqlite,
      logger: Logger({ t: 'noop' }),
    }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql-db',
      dbConnSql: f.dbConnPostgres,
      logger: Logger({ t: 'noop' }),
    })
  }

  return Promise.all(configs.map(BaseFixture))
}
