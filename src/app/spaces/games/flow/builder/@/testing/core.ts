import type { FlowClientCtx } from '../../../@/flow-client-ctx'
import { BuilderCore } from '../../core'
import type { MsgCore } from '../../types'

export const deriveModelCore = (ctx: FlowClientCtx, input: { msgCore?: MsgCore[] }) => {
  return (input.msgCore ?? []).reduce(
    (modelCore, msgCore) => BuilderCore.update({ modelCore, msgCore, ctx }),
    BuilderCore.init({ ctx })
  )
}
