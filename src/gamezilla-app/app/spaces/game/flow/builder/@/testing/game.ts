import type { FlowClientCtx } from '../../../@/flow-client-ctx'
import { BuilderCore } from '../../core'
import type { MsgCore } from '../../types'

export const deriveModelCore = (ctx: FlowClientCtx) => (input: { msgCore?: MsgCore[] }) => {
  return (input.msgCore ?? []).reduce(
    (modelCore, msgCore) =>
      BuilderCore.updateCore({
        modelCore,
        msgCore,
        ctx
      }),
    BuilderCore.initCore({
      ctx
    })
  )
}
