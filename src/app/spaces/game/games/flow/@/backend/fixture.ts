import { FixtureSpaceBackend } from '~/app/spaces/@/fixture/backend'
import { PackDb } from '../pack/pack-db'
import { PuzzleDb } from '../puzzle/puzzle-db'
import type { FlowBackendCtx } from './ctx'

export const FixtureFlowBackend = async () => {
  const f = await FixtureSpaceBackend()

  const ctx: FlowBackendCtx = {
    ...f.ctx,
    packDb: PackDb({ t: 'hash-map' }),
    puzzleDb: PuzzleDb({ t: 'hash-map' }),
  }

  return {
    ...f,
    ctx,
  }
}
