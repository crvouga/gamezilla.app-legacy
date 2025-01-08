import { PackListTypes } from '../pack/pack-list'
import { PackPuzzlesGridTypes } from '../pack/pack-puzzles-grid'
import { PuzzleListTypes } from '../puzzle/puzzle-list'
import { FlowClientCtxRoot } from './ctx-root'

export type FlowClientCtx = FlowClientCtxRoot & {
  puzzleList: PuzzleListTypes.ModelClient
  packList: PackListTypes.ModelClient
  packPuzzleGrid: PackPuzzlesGridTypes.ModelClient
}
