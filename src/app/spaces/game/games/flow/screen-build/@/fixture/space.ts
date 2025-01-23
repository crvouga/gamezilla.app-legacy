import { SpaceGameSpaceFixture } from '~/app/spaces/game/games/@/testing/sync'
import { FlowSpaceCtx } from '../../../@/space/ctx'
import { BuildSpace } from '../../space'
import type { ModelSpace, MsgSpace, UpdateSpace } from '../../types'

export const ScreenBuildSpaceFixture = async () => {
  const f = await SpaceGameSpaceFixture()
  const ctx: FlowSpaceCtx = {
    ...f.ctx,
  }

  const initial: ModelSpace = BuildSpace.initSpace({ ctx })

  const update = (initial: ModelSpace, msgs: MsgSpace[]) => {
    return msgs.reduce<ReturnType<UpdateSpace>>((acc, msgSpace) => {
      return BuildSpace.updateSpace({ ctx, modelSpace: acc, msgSpace })
    }, initial)
  }

  return {
    ...f,
    update,
    initial,
  }
}
