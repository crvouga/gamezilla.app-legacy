import { NonEmpty } from '@/core'
import type { WithEventMeta } from '@/event-sourced/event'
import { SpaceCoreFixture } from 'gamezilla-app/app/spaces/@/fixture/core'
import { PlayCore } from '../core'
import type { ModelCore, MsgClient, MsgCore, MsgToClient } from '../types'

export type FixtureUpdateInput = {
  msg?: MsgClient
  msgServer?: MsgToClient
  msgCore?: WithEventMeta<MsgCore>
}

export const CoreFixture = async () => {
  const f = await SpaceCoreFixture()

  const updates = (modelCore: ModelCore, msgs: MsgCore[]): NonEmpty<ModelCore> => {
    const [msgCore, ...rest] = msgs

    if (!msgCore) {
      return [modelCore]
    }

    const updated = PlayCore.updateCore({
      ctx: f.ctx,
      modelCore,
      msgCore
    })

    return [modelCore, ...updates(updated, rest)]
  }

  const update = (modelCore: ModelCore, msgCore: MsgCore[]): ModelCore => {
    return NonEmpty.last(updates(modelCore, msgCore))
  }

  const init = PlayCore.initCore({
    ctx: f.ctx
  })

  return {
    init,
    f,
    updates,
    update
  }
}
