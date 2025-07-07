import { Logger } from '~/@/logger'
import { MigrationPolicy } from '~/@/migration-policy/impl'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { SpaceGameFixtureBackend } from '../../../../@/testing/backend'
import { NumberlinkBackendCtx } from '../../../@/backend/ctx'
import { PackDb } from '../../../@/pack/pack-db/impl'
import { PuzzleDb } from '../../../@/puzzle/puzzle-db'

const initCtx = async (ctx: SpaceBackendCtx): Promise<NumberlinkBackendCtx> => {
  const f = await FixtureAppBackend()
  switch (f.t) {
    case 'integration': {
      return {
        ...ctx,
        numberlinkPackDb: PackDb({
          t: 'sql-db',
          sqlDb: f.sqlDbPostgres,
          logger: Logger({ t: 'noop' }),
          migrationPolicy: MigrationPolicy({ t: 'always-run', logger: Logger({ t: 'noop' }) }),
        }),
        numberlinkPuzzleDb: PuzzleDb({
          t: 'sql-db',
          sqlDb: f.sqlDbPostgres,
          logger: Logger({ t: 'noop' }),
          migrationPolicy: MigrationPolicy({ t: 'always-run', logger: Logger({ t: 'noop' }) }),
        }),
      }
    }
    case 'unit': {
      return {
        ...ctx,
        numberlinkPackDb: PackDb({ t: 'hash-map' }),
        numberlinkPuzzleDb: PuzzleDb({ t: 'hash-map' }),
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
