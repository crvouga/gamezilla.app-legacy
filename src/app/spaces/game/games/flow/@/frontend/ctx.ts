import { PackLoaderTypes } from '../pack/pack-loader'
import { PuzzleLoaderTypes } from '../puzzle/puzzle-loader'
import { FlowFrontendCtxBase } from './ctx-base'

export type FlowFrontendCtx = FlowFrontendCtxBase & {
  puzzleDbQuery: PuzzleLoaderTypes.ModelFrontend
  packDbQuery: PackLoaderTypes.ModelFrontend
}
