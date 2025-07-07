import { SYNC_REGISTRY } from '~/@/sync-engine/sync'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { NumberlinkBackendCtx } from './@/backend/ctx'
import { PackDb } from './@/pack/pack-db'
import { PackSync } from './@/pack/pack-sync'
import { PuzzleDb } from './@/puzzle/puzzle-db'
import { PuzzleSync } from './@/puzzle/puzzle-sync'
import { MigrationPolicy } from '~/@/migration-policy'

const initCtx = (input: { ctx: SpaceBackendCtx }): NumberlinkBackendCtx => {
  const numberlinkPuzzleDb = PuzzleDb({
    t: 'sql-db',
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: MigrationPolicy({ t: 'always-run', logger: input.ctx.logger }),
  })
  const numberlinkPackDb = PackDb({ t: 'sql-db', sqlDb: input.ctx.sqlDb, logger: input.ctx.logger })
  SYNC_REGISTRY.add(PuzzleSync({ numberlinkPuzzleDb }))
  SYNC_REGISTRY.add(PackSync({ numberlinkPackDb }))

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
