import { uploadDataRegistry } from '~/@/upload-data/registry'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { NumberlinkBackendCtx } from './@/backend/ctx'
import { PackDb } from './@/pack/pack-db'
import { UploadDataPack } from './@/pack/upload-data'
import { PuzzleDb } from './@/puzzle/puzzle-db'
import { UploadDataPuzzle } from './@/puzzle/upload-data'

const initCtx = (input: { ctx: SpaceBackendCtx }): NumberlinkBackendCtx => {
  const numberlinkPuzzleDb = PuzzleDb({ t: 'sql-db', sqlDb: input.ctx.sqlDb, logger: input.ctx.logger })
  const numberlinkPackDb = PackDb({ t: 'sql-db', sqlDb: input.ctx.sqlDb, logger: input.ctx.logger })
  uploadDataRegistry.add(UploadDataPuzzle({ numberlinkPuzzleDb }))
  uploadDataRegistry.add(UploadDataPack({ numberlinkPackDb }))

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
