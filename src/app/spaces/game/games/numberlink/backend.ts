import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { NumberlinkBackendCtx } from './@/backend/ctx'
import { PackDb } from './@/pack/pack-db'
import { PuzzleDb } from './@/puzzle/puzzle-db'

const initCtx = (input: { ctx: SpaceBackendCtx }): NumberlinkBackendCtx => {
  return {
    ...input.ctx,
    flowPuzzleDb: PuzzleDb({ t: 'sql-db', sqlDb: input.ctx.postgres, logger: input.ctx.logger }),
    flowPackDb: PackDb({ t: 'sql-db', sqlDb: input.ctx.postgres, logger: input.ctx.logger }),
  }
}

const worker = async (_s: AbortSignal, _input: { ctx: NumberlinkBackendCtx }) => {}

export const NumberlinkBackend = {
  initCtx,
  worker,
}
