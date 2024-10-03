import { SpaceServerCtx } from 'gamezilla-app/app/spaces/@/space'
import { IFlowPackDb } from './flow-pack/flow-pack-db'
import { IFlowPuzzleDb } from './flow-puzzle/flow-puzzle-db'

export type FlowServerCtx = SpaceServerCtx & {
  flowPuzzleDb: IFlowPuzzleDb
  flowPackDb: IFlowPackDb
}
