import { AppServerTestEnv } from '~/app/@/server/server-test-env'
import { SpaceGameFixtureServer } from '../../../../@/testing/server'
import { FlowPackDb } from '../../../@/pack/pack-db'
import { FlowPuzzleDb } from '../../../@/puzzle/puzzle-db'
import { initServer } from '../../types'
import { BuilderCore } from '../../core'
import { Logger } from '~/app/@/server/logger'
import { FlowServerCtx } from '../../../@/flow-server-ctx'
import { SpaceServerCtx } from '~/app/spaces/@/space-server-ctx'

export const initial = {
  model: initServer
}

export const initCtx = async (ctx: SpaceServerCtx): Promise<FlowServerCtx> => {
  const testEnv = await AppServerTestEnv()
  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      return {
        ...ctx,
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
        ...ctx,
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
  const ctx = await initCtx(f.ctx)
  const model = initServer
  const modelCore = BuilderCore.init({ ctx })
  return {
    ...f,
    ctx,
    model,
    modelCore
  }
}
