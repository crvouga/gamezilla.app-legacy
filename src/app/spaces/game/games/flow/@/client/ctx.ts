import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'
import { Pack } from '../pack/pack'
import { PackId } from '../pack/pack-id'
import { PackListTypes } from '../pack/pack-list'
import { PackPuzzlesGridTypes } from '../pack/pack-puzzles-grid'
import type { Puzzle } from '../puzzle/puzzle'
import type { PuzzleId } from '../puzzle/puzzle-id'
import { PuzzleListTypes } from '../puzzle/puzzle-list'
import { Solutions } from '../solutions/solutions'

export type FlowClientCtx = SpaceClientCtx & {
  packs: {
    [id: PackId]: Pack
  }
  puzzles: {
    [id: PuzzleId]: Puzzle
  }
  solutions: Solutions
  puzzleList: PuzzleListTypes.ModelClient
  packList: PackListTypes.ModelClient
  packPuzzleGrid: PackPuzzlesGridTypes.ModelClient
}
