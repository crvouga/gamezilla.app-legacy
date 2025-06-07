import { FlowFrontendCtx } from '../../frontend/ctx'
import { NumberlinkVariant } from '../../variant'

export type ModePlayFrontendCtx = FlowFrontendCtx & {
  numberlink: NumberlinkVariant.Model
}
