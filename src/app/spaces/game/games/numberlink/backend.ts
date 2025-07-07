import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { NumberlinkBackendCtx } from './@/backend/ctx'
import { PackDb } from './@/pack/pack-db'
import { PackSync } from './@/pack/pack-sync'
import { PuzzleDb } from './@/puzzle/puzzle-db'
import { PuzzleSync } from './@/puzzle/puzzle-sync'

const initCtx = (input: { ctx: SpaceBackendCtx }): NumberlinkBackendCtx => {
  const numberlinkPuzzleDb = PuzzleDb({
    t: 'sql-db',
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: input.ctx.migrationPolicy,
  })
  const numberlinkPackDb = PackDb({
    t: 'sql-db',
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: input.ctx.migrationPolicy,
  })
  input.ctx.syncEngine.registerSync(PuzzleSync({ numberlinkPuzzleDb }))
  input.ctx.syncEngine.registerSync(PackSync({ numberlinkPackDb }))

  return {
    ...input.ctx,
    numberlinkPuzzleDb,
    numberlinkPackDb,
  }
}

const worker = async (_s: AbortSignal, _input: { ctx: NumberlinkBackendCtx }) => {}

export const NumberlinkBackend = {
  initCtx,
  worker,
}
