import { FlowFrontendCtx } from '../../frontend/ctx'
import { Variant } from '../../variant'

export type ModePlayFrontendCtx = FlowFrontendCtx & {
  flow: Variant.Model
}
