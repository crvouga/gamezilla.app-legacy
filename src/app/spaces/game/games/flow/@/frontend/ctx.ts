import { PackDbQueryTypes } from '../pack/pack-db-query'
import { PuzzleDbQueryTypes } from '../puzzle/puzzle-db-query'
import { FlowFrontendCtxRoot } from './ctx-root'

export type FlowFrontendCtx = FlowFrontendCtxRoot & {
  puzzleDbQuery: PuzzleDbQueryTypes.ModelFrontend
  packDbQuery: PackDbQueryTypes.ModelFrontend
}
