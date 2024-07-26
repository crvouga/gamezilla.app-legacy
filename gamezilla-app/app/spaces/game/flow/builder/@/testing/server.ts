import { AppServerTestEnv } from 'gamezilla-app/app/@/server/server-test-env'
import { SpaceGameFixtureServer } from '../../../../@/testing/server'
import { FlowPackDb } from '../../../@/flow-pack/flow-pack-db'
import { FlowPuzzleDb } from '../../../@/flow-puzzle/flow-puzzle-db'
import { initServer, type FlowServerDeps } from '../../builder.types'
import { BuilderCore } from '../../builder.core'
import { Logger } from 'gamezilla-app/app/@/server/logger'

export const initial = {
  model: initServer
}

export const getDeps = async (): Promise<FlowServerDeps> => {
  const testEnv = await AppServerTestEnv()
  switch (testEnv.t) {
    case 'integration': {
      return {
        flowPackDb: FlowPackDb({
          t: 'db-conn-sql',
          dbConnSql: testEnv.dbConnSql
        }),
        flowPuzzleDb: FlowPuzzleDb({
          t: 'db-conn-sql',
          dbConnSql: testEnv.dbConnSql,
          logger: Logger({
            t: 'noop'
          })
        })
      }
    }
    case 'unit': {
      return {
        flowPackDb: FlowPackDb({
          t: 'hash-map'
        }),
        flowPuzzleDb: FlowPuzzleDb({
          t: 'hash-map'
        })
      }
    }
  }
}

export const FlowCreateFixtureServer = async () => {
  const f = await SpaceGameFixtureServer()
  const deps = await getDeps()
  const model = initServer
  const modelCore = BuilderCore.initCore({
    ctx: f.ctx
  })
  return {
    ...f,
    deps,
    model,
    modelCore
  }
}
