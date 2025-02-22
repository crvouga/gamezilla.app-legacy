import { PackLoaderTypes } from '../pack/pack-loader'
import { PuzzleLoaderTypes } from '../puzzle/puzzle-loader'
import { SolutionsFinderTypes } from '../solutions/solutions-finder'
import { SolutionsLoaderTypes } from '../solutions/solutions-loader'
import { FlowFrontendCtxBase } from './ctx-base'

export type FlowFrontendCtx = FlowFrontendCtxBase & {
  puzzleLoader: PuzzleLoaderTypes.ModelFrontend
  packLoader: PackLoaderTypes.ModelFrontend
  solutionsFinder: SolutionsFinderTypes.ModelFrontend
  solutionsLoader: SolutionsLoaderTypes.ModelFrontend
}
