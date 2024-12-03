import { AppServerTestEnv } from 'app/@/server/server-test-env'
import { Logger } from 'app/@/server/logger'
import { FlowPuzzleDb } from './impl'

export const FlowPuzzleDbFixture = async () => {
  const testEnv = await AppServerTestEnv()
  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      const flowPuzzleDb = FlowPuzzleDb({
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
      const flowPuzzleDb = FlowPuzzleDb({
        t: 'hash-map'
      })
      return {
        flowPuzzleDb
      }
    }
  }
}
