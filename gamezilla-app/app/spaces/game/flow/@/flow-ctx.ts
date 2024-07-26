import type { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space'
import { FlowPack } from './flow-pack'
import { FlowPackId } from './flow-pack/flow-pack-id'
import type { FlowPuzzle } from './flow-puzzle/flow-puzzle'
import type { FlowPuzzleId } from './flow-puzzle/flow-puzzle-id'

export type FlowClientCtx = SpaceClientCtx & {
  flowPacks: {
    [flowPackId: FlowPackId]: FlowPack
  }
  flowPuzzles: {
    [flowPuzzleId: FlowPuzzleId]: FlowPuzzle
  }
}
