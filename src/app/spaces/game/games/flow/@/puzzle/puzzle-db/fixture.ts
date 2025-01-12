import { AppBackendTestEnv } from '~/app/@/server/fixture'
import { Logger } from '~/@/logger'
import { PuzzleDb } from './impl'

export const PuzzleDbFixture = async () => {
  const testEnv = await AppBackendTestEnv()
  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      const flowPuzzleDb = PuzzleDb({
        t: 'db-conn-sql',
        dbConnSql: testEnv.dbConnSql,
        logger: Logger({
          t: 'noop',
        }),
      })

      return {
        flowPuzzleDb,
      }
    }
    case 'unit': {
      const flowPuzzleDb = PuzzleDb({
        t: 'hash-map',
      })
      return {
        flowPuzzleDb,
      }
    }
  }
}
