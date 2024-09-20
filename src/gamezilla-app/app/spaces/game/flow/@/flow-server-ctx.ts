import { SpaceServerCtx } from 'gamezilla-app/app/spaces/@/space'
import { IFlowPackDb } from './flow-pack'
import { IFlowPuzzleDb } from './flow-puzzle'

export type FlowServerCtx = SpaceServerCtx & {
  flowPuzzleDb: IFlowPuzzleDb
  flowPackDb: IFlowPackDb
}
