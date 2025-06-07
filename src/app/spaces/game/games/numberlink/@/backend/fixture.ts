import { FixtureSpaceBackend } from '~/app/spaces/@/fixture/backend'
import { PackDb } from '../pack/pack-db'
import { PuzzleDb } from '../puzzle/puzzle-db'
import type { NumberlinkBackendCtx } from './ctx'

export const FixtureFlowBackend = async () => {
  const f = await FixtureSpaceBackend()

  const ctx: NumberlinkBackendCtx = {
    ...f.ctx,
    numberlinkPackDb: PackDb({ t: 'hash-map' }),
    numberlinkPuzzleDb: PuzzleDb({ t: 'hash-map' }),
  }

  return {
    ...f,
    ctx,
  }
}
