import { PackLoaderTypes } from '../pack/pack-loader'
import { PuzzleLoaderTypes } from '../puzzle/puzzle-loader'
import { HintCalculatorTypes } from '../solutions/hint-calculator'
import { SolutionsLoaderTypes } from '../solutions/solutions-loader'
import { FlowFrontendCtxBase } from './ctx-base'

export type FlowFrontendCtx = FlowFrontendCtxBase & {
  puzzleLoader: PuzzleLoaderTypes.ModelFrontend
  packLoader: PackLoaderTypes.ModelFrontend
  HintCalculator: HintCalculatorTypes.ModelFrontend
  solutionsLoader: SolutionsLoaderTypes.ModelFrontend
}
