import type { WithEventId } from 'gamezilla-app/app/spaces/@/event'
import type { FlowClientCtx } from '../../../@/flow-client-ctx'
import type { MsgCore } from '../../types'
import { BuilderCore } from '../../core'

export const deriveModelCore = (ctx: FlowClientCtx) => (input: { msgCore?: WithEventId<MsgCore>[] }) => {
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
