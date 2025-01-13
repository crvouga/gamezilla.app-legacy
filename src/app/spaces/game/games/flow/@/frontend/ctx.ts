import { PackListTypes } from '../pack/pack-list'
import { PackPuzzlesGridTypes } from '../pack/pack-puzzles-grid'
import { PuzzleListTypes } from '../puzzle/puzzle-list'
import { FlowFrontendCtxRoot } from './ctx-root'

export type FlowFrontendCtx = FlowFrontendCtxRoot & {
  puzzleList: PuzzleListTypes.ModelFrontend
  packList: PackListTypes.ModelFrontend
  packPuzzleGrid: PackPuzzlesGridTypes.ModelFrontend
}
