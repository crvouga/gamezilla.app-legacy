import { NonEmpty } from '~/@/array/non-empty'
import type { WithEventMeta } from '~/@/event-sourced/event'
import { SpaceSpaceFixture } from '~/app/spaces/@/fixture/space'
import { FlowSpaceCtx } from '../../../@/space/ctx'
import { PlaySpace } from '../../space'
import type { ModelSpace, MsgFrontend, MsgSpace, MsgToFrontend } from '../../types'
import { Solutions } from '../../../@/solutions/solutions'

export type FixtureUpdateInput = {
  msg?: MsgFrontend
  msgBackend?: MsgToFrontend
  msgSpace?: WithEventMeta<MsgSpace>
}

export const SpaceFixture = async () => {
  const f = await SpaceSpaceFixture()

  const ctx: FlowSpaceCtx = {
    ...f.ctx,
    solutions: Solutions.init,
  }

  const updates = (modelSpace: ModelSpace, msgs: MsgSpace[]): NonEmpty<ModelSpace> => {
    const [msgSpace, ...rest] = msgs

    if (!msgSpace) {
      return [modelSpace]
    }

    const updated = PlaySpace.updateSpace({
      ctx,
      modelSpace,
      msgSpace,
    })

    return [modelSpace, ...updates(updated, rest)]
  }

  const update = (modelSpace: ModelSpace, msgSpace: MsgSpace[]): ModelSpace => {
    return NonEmpty.last(updates(modelSpace, msgSpace))
  }

  const init = PlaySpace.initSpace({
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
