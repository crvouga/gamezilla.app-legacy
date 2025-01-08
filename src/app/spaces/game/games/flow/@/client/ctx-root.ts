import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'
import { Pack } from '../pack/pack'
import { PackId } from '../pack/pack-id'
import type { Puzzle } from '../puzzle/puzzle'
import type { PuzzleId } from '../puzzle/puzzle-id'
import { Solutions } from '../solutions/solutions'

export type FlowClientCtxRoot = SpaceClientCtx & {
  packs: {
    [id: PackId]: Pack
  }
  puzzles: {
    [id: PuzzleId]: Puzzle
  }
  solutions: Solutions
}
