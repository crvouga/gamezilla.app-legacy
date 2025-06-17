import { uploadDataRegistry } from '~/@/upload-data/upload-data-registry'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { NumberlinkBackendCtx } from './@/backend/ctx'
import { PackDb } from './@/pack/pack-db'
import { PuzzleDb } from './@/puzzle/puzzle-db'

const initCtx = (input: { ctx: SpaceBackendCtx }): NumberlinkBackendCtx => {
  const numberlinkPuzzleDb = PuzzleDb({ t: 'sql-db', sqlDb: input.ctx.sqlDb, logger: input.ctx.logger })
  const numberlinkPackDb = PackDb({ t: 'sql-db', sqlDb: input.ctx.sqlDb, logger: input.ctx.logger })
  uploadDataRegistry.add(PuzzleDb.UploadData({ numberlinkPuzzleDb }))
  uploadDataRegistry.add(PackDb.UploadData({ numberlinkPackDb }))
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
