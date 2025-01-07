import { Logger } from '~/@/logger'
import { AppServerTestEnv } from '~/app/@/server/fixture'
import { SpaceServerCtx } from '~/app/spaces/@/space-server/ctx'
import { SpaceGameFixtureServer } from '../../../../@/testing/server'
import { PackDb } from '../../../@/pack/pack-db'
import { PuzzleDb } from '../../../@/puzzle/puzzle-db'
import { FlowServerCtx } from '../../../@/server/ctx'
import { Solutions } from '../../../@/solutions/solutions'
import { BuilderCore } from '../../core'
import { initServer } from '../../types'

const initCtx = async (ctx: SpaceServerCtx): Promise<FlowServerCtx> => {
  const testEnv = await AppServerTestEnv()
  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      return {
        ...ctx,
        packDb: PackDb({ t: 'db-conn-sql', dbConnSql: testEnv.dbConnSql }),
        puzzleDb: PuzzleDb({ t: 'db-conn-sql', dbConnSql: testEnv.dbConnSql, logger: Logger({ t: 'noop' }) }),
        solutions: Solutions.init,
      }
    }
    case 'unit': {
      return {
        ...ctx,
        packDb: PackDb({ t: 'hash-map' }),
        puzzleDb: PuzzleDb({ t: 'hash-map' }),
        solutions: Solutions.init,
      }
    }
  }
}

export const FlowCreateFixtureServer = async () => {
  const f = await SpaceGameFixtureServer()
  const ctx = await initCtx(f.ctx)
  const model = initServer
  const modelCore = BuilderCore.initCore({ ctx })
  return {
    ...f,
    ctx,
    model,
    modelCore,
  }
}
