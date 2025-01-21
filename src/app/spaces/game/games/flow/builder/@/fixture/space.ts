import { SpaceGameSpaceFixture } from '~/app/spaces/game/games/@/testing/sync'
import { Solutions } from '../../../@/solutions/solutions'
import { FlowSpaceCtx } from '../../../@/space/ctx'
import { BuilderSpace } from '../../space'
import type { ModelSpace, MsgSpace, UpdateSpace } from '../../types'

export const ScreenBuilderSpaceFixture = async () => {
  const f = await SpaceGameSpaceFixture()
  const ctx: FlowSpaceCtx = {
    ...f.ctx,
    solutions: Solutions.init,
  }

  const initial: ModelSpace = BuilderSpace.initSpace({ ctx })

  const update = (initial: ModelSpace, msgs: MsgSpace[]) => {
    return msgs.reduce<ReturnType<UpdateSpace>>((acc, msgSpace) => {
      return BuilderSpace.updateSpace({ ctx, modelSpace: acc, msgSpace })
    }, initial)
  }

  return {
    ...f,
    update,
    initial,
  }
}
