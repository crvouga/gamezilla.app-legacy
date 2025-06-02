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
    sqlDb: f.sqlDbite,
    puzzleDb: PuzzleDb({
      t: 'sql-db',
      sqlDb: f.sqlDbite,
      logger: Logger({ t: 'noop' }),
    }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql-db',
      sqlDb: f.dbConnPostgres,
      logger: Logger({ t: 'noop' }),
    })
  }

  return Promise.all(configs.map(BaseFixture))
}
