import type { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { BuilderSpace } from '../../space'
import type { MsgSpace } from '../../types'

export const deriveModelSpace = (ctx: FlowFrontendCtx, input: { msgSpace?: MsgSpace[] }) => {
  return (input.msgSpace ?? []).reduce(
    (modelSpace, msgSpace) => BuilderSpace.updateSpace({ modelSpace, msgSpace, ctx }),
    BuilderSpace.initSpace({ ctx }),
  )
}
