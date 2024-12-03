import { SpaceClientCtx } from '~/app/spaces/@/space-client-ctx'
import { FlowPack } from './pack/pack'
import { FlowPackId } from './pack/pack-id'
import { PackListTypes } from './pack/pack-list'
import { PackPuzzlesGridTypes } from './pack/pack-puzzles-grid'
import type { FlowPuzzle } from './puzzle/puzzle'
import type { FlowPuzzleId } from './puzzle/puzzle-id'
import { PuzzleListTypes } from './puzzle/puzzle-list'

export type FlowClientCtx = SpaceClientCtx & {
  packs: {
    [id: FlowPackId]: FlowPack
  }
  puzzles: {
    [id: FlowPuzzleId]: FlowPuzzle
  }
  puzzleList: PuzzleListTypes.ModelClient
  packList: PackListTypes.ModelClient
  packPuzzleGrid: PackPuzzlesGridTypes.ModelClient
}
