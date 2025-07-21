import { HintCalculatorTypes } from '../solutions/hint-calculator'
import { FlowFrontendCtxBase } from './ctx-base'

export type FlowFrontendCtx = FlowFrontendCtxBase & {
  hintCalculator: HintCalculatorTypes.ModelFrontend
}
