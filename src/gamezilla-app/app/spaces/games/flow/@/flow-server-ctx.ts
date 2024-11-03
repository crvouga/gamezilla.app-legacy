import { SpaceServerCtx } from 'gamezilla-app/app/spaces/@/space-server-ctx'
import { IFlowPackDb } from './pack/pack-db'
import { IFlowPuzzleDb } from './puzzle/puzzle-db'

export type FlowServerCtx = SpaceServerCtx & {
  flowPuzzleDb: IFlowPuzzleDb
  flowPackDb: IFlowPackDb
}
