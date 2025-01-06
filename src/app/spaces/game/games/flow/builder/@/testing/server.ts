import { AppServerTestEnv } from '~/app/@/server/fixture'
import { SpaceGameFixtureServer } from '../../../../@/testing/server'
import { PackDb } from '../../../@/pack/pack-db'
import { PuzzleDb } from '../../../@/puzzle/puzzle-db'
import { initServer } from '../../types'
import { BuilderCore } from '../../core'
import { Logger } from '~/@/logger'
import { FlowServerCtx } from '../../../@/server/ctx'
import { SpaceServerCtx } from '~/app/spaces/@/space-server/ctx'

export const initial = {
  model: initServer,
}

export const initCtx = async (ctx: SpaceServerCtx): Promise<FlowServerCtx> => {
  const testEnv = await AppServerTestEnv()
  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      return {
        ...ctx,
        flowPackDb: PackDb({
          t: 'db-conn-sql',
          dbConnSql: testEnv.dbConnSql,
        }),
        flowPuzzleDb: PuzzleDb({
          t: 'db-conn-sql',
          dbConnSql: testEnv.dbConnSql,
          logger: Logger({
            t: 'noop',
          }),
        }),
      }
    }
    case 'unit': {
      return {
        ...ctx,
        flowPackDb: PackDb({
          t: 'hash-map',
        }),
        flowPuzzleDb: PuzzleDb({
          t: 'hash-map',
        }),
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
    modelCore,
  }
}
