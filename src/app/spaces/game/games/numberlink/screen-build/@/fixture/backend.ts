import { Logger } from '~/@/logger'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { SpaceGameFixtureBackend } from '../../../../@/testing/backend'
import { FlowBackendCtx } from '../../../@/backend/ctx'
import { PackDb } from '../../../@/pack/pack-db/impl'
import { PuzzleDb } from '../../../@/puzzle/puzzle-db'

const initCtx = async (ctx: SpaceBackendCtx): Promise<FlowBackendCtx> => {
  const f = await FixtureAppBackend()
  switch (f.t) {
    case 'integration': {
      return {
        ...ctx,
        flowPackDb: PackDb({
          t: 'sql-db',
          sqlDb: f.dbConnPostgres,
          logger: Logger({ t: 'noop' }),
        }),
        flowPuzzleDb: PuzzleDb({
          t: 'sql-db',
          sqlDb: f.dbConnPostgres,
          logger: Logger({ t: 'noop' }),
        }),
      }
    }
    case 'unit': {
      return {
        ...ctx,
        flowPackDb: PackDb({ t: 'hash-map' }),
        flowPuzzleDb: PuzzleDb({ t: 'hash-map' }),
      }
    }
  }
}

export const FlowCreateFixtureBackend = async () => {
  const f = await SpaceGameFixtureBackend()
  const ctx = await initCtx(f.ctx)

  return {
    ...f,
    ctx,
  }
}
