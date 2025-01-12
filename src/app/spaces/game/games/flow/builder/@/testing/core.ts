import type { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { BuilderCore } from '../../core'
import type { MsgCore } from '../../types'

export const deriveModelCore = (ctx: FlowFrontendCtx, input: { msgCore?: MsgCore[] }) => {
  return (input.msgCore ?? []).reduce(
    (modelCore, msgCore) => BuilderCore.updateCore({ modelCore, msgCore, ctx }),
    BuilderCore.initCore({ ctx }),
  )
}
