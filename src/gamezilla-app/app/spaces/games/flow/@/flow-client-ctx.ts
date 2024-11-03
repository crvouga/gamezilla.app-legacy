import type { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space'
import { FlowPack } from './pack/pack'
import { FlowPackId } from './pack/pack-id'
import { FlowPackListTypes } from './pack/pack-list'
import { FlowPackPuzzlesGridTypes } from './pack/pack-puzzles-grid'
import type { FlowPuzzle } from './puzzle/puzzle'
import type { FlowPuzzleId } from './puzzle/puzzle-id'
import { FlowPuzzleListTypes } from './puzzle/puzzle-list'

export type FlowClientCtx = SpaceClientCtx & {
  packs: {
    [id: FlowPackId]: FlowPack
  }
  puzzles: {
    [id: FlowPuzzleId]: FlowPuzzle
  }
  puzzleList: FlowPuzzleListTypes.ModelClient
  packList: FlowPackListTypes.ModelClient
  packPuzzleGrid: FlowPackPuzzlesGridTypes.ModelClient
}
