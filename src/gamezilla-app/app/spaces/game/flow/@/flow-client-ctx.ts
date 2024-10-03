import type { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space'
import { FlowPack } from './pack/pack'
import { FlowPackId } from './pack/pack-id'
import { FlowPackListTypes } from './pack/pack-list'
import { FlowPackPuzzlesGridTypes } from './pack/pack-puzzles-grid'
import type { FlowPuzzle } from './puzzle/puzzle'
import type { FlowPuzzleId } from './puzzle/puzzle-id'
import { FlowPuzzleListTypes } from './puzzle/puzzle-list'

export type FlowClientCtx = SpaceClientCtx & {
  flowPacks: {
    [flowPackId: FlowPackId]: FlowPack
  }
  flowPuzzles: {
    [flowPuzzleId: FlowPuzzleId]: FlowPuzzle
  }
  flowPuzzleList: FlowPuzzleListTypes.ModelClient
  flowPackList: FlowPackListTypes.ModelClient
  flowPackPuzzleGrid: FlowPackPuzzlesGridTypes.ModelClient
}
