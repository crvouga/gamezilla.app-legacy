import { AppServerTestEnv } from '~/app/@/server/server-test-env'
import { Logger } from '~/app/@/server/logger'
import { PuzzleDb } from './impl'

export const PuzzleDbFixture = async () => {
  const testEnv = await AppServerTestEnv()
  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      const flowPuzzleDb = PuzzleDb({
        t: 'db-conn-sql',
        dbConnSql: testEnv.dbConnSql,
        logger: Logger({
          t: 'noop'
        })
      })

      return {
        flowPuzzleDb
      }
    }
    case 'unit': {
      const flowPuzzleDb = PuzzleDb({
        t: 'hash-map'
      })
      return {
        flowPuzzleDb
      }
    }
  }
}
