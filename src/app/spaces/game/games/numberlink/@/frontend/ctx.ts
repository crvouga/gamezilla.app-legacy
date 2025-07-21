import { PackLoaderTypes } from '../pack/pack-loader'
import { HintCalculatorTypes } from '../solutions/hint-calculator'
import { SolutionsLoaderTypes } from '../solutions/solutions-loader'
import { FlowFrontendCtxBase } from './ctx-base'

export type FlowFrontendCtx = FlowFrontendCtxBase & {
  packLoader: PackLoaderTypes.ModelFrontend
  hintCalculator: HintCalculatorTypes.ModelFrontend
  solutionsLoader: SolutionsLoaderTypes.ModelFrontend
}
