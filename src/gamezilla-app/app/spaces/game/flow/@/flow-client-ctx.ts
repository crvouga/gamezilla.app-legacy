import type { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space'
import { FlowPack, FlowPackListTypes } from './flow-pack'
import { FlowPackId } from './flow-pack/flow-pack-id'
import type { FlowPuzzle } from './flow-puzzle/flow-puzzle'
import type { FlowPuzzleId } from './flow-puzzle/flow-puzzle-id'
import { FlowPuzzleListTypes } from './flow-puzzle'

export type FlowClientCtx = SpaceClientCtx & {
  flowPacks: {
    [flowPackId: FlowPackId]: FlowPack
  }
  flowPuzzles: {
    [flowPuzzleId: FlowPuzzleId]: FlowPuzzle
  }
  flowPuzzleList: FlowPuzzleListTypes.ModelClient
  flowPackList: FlowPackListTypes.ModelClient
}
