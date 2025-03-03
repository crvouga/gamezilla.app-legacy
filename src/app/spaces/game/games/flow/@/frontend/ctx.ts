import { PackLoaderTypes } from '../pack/pack-loader'
import { PuzzleLoaderTypes } from '../puzzle/puzzle-loader'
import { HintLoaderTypes } from '../solutions/hint-loader'
import { SolutionsLoaderTypes } from '../solutions/solutions-loader'
import { FlowFrontendCtxBase } from './ctx-base'

export type FlowFrontendCtx = FlowFrontendCtxBase & {
  puzzleLoader: PuzzleLoaderTypes.ModelFrontend
  packLoader: PackLoaderTypes.ModelFrontend
  HintLoader: HintLoaderTypes.ModelFrontend
  solutionsLoader: SolutionsLoaderTypes.ModelFrontend
}
