import { HintCalculatorTypes } from '../solutions/hint-calculator'
import { SolutionsLoaderTypes } from '../solutions/solutions-loader'
import { FlowFrontendCtxBase } from './ctx-base'

export type FlowFrontendCtx = FlowFrontendCtxBase & {
  hintCalculator: HintCalculatorTypes.ModelFrontend
  solutionsLoader: SolutionsLoaderTypes.ModelFrontend
}
