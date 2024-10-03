import type { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space'
import { FlowPack } from './flow-pack/flow-pack'
import { FlowPackId } from './flow-pack/flow-pack-id'
import { FlowPackListTypes } from './flow-pack/flow-pack-list'
import { FlowPackPuzzlesGridTypes } from './flow-pack/flow-pack-puzzles-grid'
import type { FlowPuzzle } from './flow-puzzle/flow-puzzle'
import type { FlowPuzzleId } from './flow-puzzle/flow-puzzle-id'
import { FlowPuzzleListTypes } from './flow-puzzle/flow-puzzle-list'

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
