import { Logger } from '~/@/logger'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { SpaceGameFixtureBackend } from '../../../../@/testing/backend'
import { FlowBackendCtx } from '../../../@/backend/ctx'
import { PackDb } from '../../../@/pack/pack-db/impl'
import { PuzzleDb } from '../../../@/puzzle/puzzle-db'
import { BuildSpace } from '../../space'

const initCtx = async (ctx: SpaceBackendCtx): Promise<FlowBackendCtx> => {
  const f = await FixtureAppBackend()
  switch (f.t) {
    case 'integration': {
      return {
        ...ctx,
        packDb: PackDb({
          t: 'db-conn-sql',
          dbConnSql: f.dbConnPostgres,
          logger: Logger({ t: 'noop' }),
        }),
        puzzleDb: PuzzleDb({
          t: 'db-conn-sql',
          dbConnSql: f.dbConnPostgres,
          logger: Logger({ t: 'noop' }),
        }),
      }
    }
    case 'unit': {
      return {
        ...ctx,
        packDb: PackDb({ t: 'hash-map' }),
        puzzleDb: PuzzleDb({ t: 'hash-map' }),
      }
    }
  }
}

export const FlowCreateFixtureBackend = async () => {
  const f = await SpaceGameFixtureBackend()
  const ctx = await initCtx(f.ctx)

  const modelSpace = BuildSpace.initSpace({ ctx })
  return {
    ...f,
    ctx,
    modelSpace,
  }
}
