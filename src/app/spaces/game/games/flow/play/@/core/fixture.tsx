import { NonEmpty } from '~/@/array/non-empty'
import type { WithEventMeta } from '~/@/event-sourced/event'
import { SpaceCoreFixture } from '~/app/spaces/@/fixture/core'
import { FlowCoreCtx } from '../../../@/core/ctx'
import { PlayCore } from '../../core'
import type { ModelCore, MsgFrontend, MsgCore, MsgToFrontend } from '../../types'
import { Solutions } from '../../../@/solutions/solutions'

export type FixtureUpdateInput = {
  msg?: MsgFrontend
  msgBackend?: MsgToFrontend
  msgCore?: WithEventMeta<MsgCore>
}

export const CoreFixture = async () => {
  const f = await SpaceCoreFixture()

  const ctx: FlowCoreCtx = {
    ...f.ctx,
    solutions: Solutions.init,
  }

  const updates = (modelCore: ModelCore, msgs: MsgCore[]): NonEmpty<ModelCore> => {
    const [msgCore, ...rest] = msgs

    if (!msgCore) {
      return [modelCore]
    }

    const updated = PlayCore.updateCore({
      ctx,
      modelCore,
      msgCore,
    })

    return [modelCore, ...updates(updated, rest)]
  }

  const update = (modelCore: ModelCore, msgCore: MsgCore[]): ModelCore => {
    return NonEmpty.last(updates(modelCore, msgCore))
  }

  const init = PlayCore.initCore({
    ctx,
  })

  return {
    ...f,
    init,
    ctx,
    updates,
    update,
  }
}
