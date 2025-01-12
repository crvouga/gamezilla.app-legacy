import { Logger } from '~/@/logger'
import { AppBackendTestEnv } from '~/app/@/backend/fixture'
import { SpaceBackendCtx } from '~/app/spaces/@/space-backend/ctx'
import { SpaceGameFixtureBackend } from '../../../../@/testing/backend'
import { PackDb } from '../../../@/pack/pack-db'
import { PuzzleDb } from '../../../@/puzzle/puzzle-db'
import { FlowBackendCtx } from '../../../@/backend/ctx'
import { Solutions } from '../../../@/solutions/solutions'
import { BuilderSpace } from '../../space'
import { initBackend } from '../../types'

const initCtx = async (ctx: SpaceBackendCtx): Promise<FlowBackendCtx> => {
  const testEnv = await AppBackendTestEnv()
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

export const FlowCreateFixtureBackend = async () => {
  const f = await SpaceGameFixtureBackend()
  const ctx = await initCtx(f.ctx)
  const model = initBackend
  const modelSpace = BuilderSpace.initSpace({ ctx })
  return {
    ...f,
    ctx,
    model,
    modelSpace,
  }
}
