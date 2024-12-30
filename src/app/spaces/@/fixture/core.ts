import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { SpaceCore } from '../../core/space-core'
import { SpaceCtx } from '../space/ctx'
import { makeSpace } from './shared'

export const SpaceCoreFixture = async () => {
  const spaceId = SpaceId.generate()
  const hostId = UserId.generate()
  const guestId = UserId.generate()
  const spaceState = SpaceCore.toSpaceStarted(
    makeSpace({
      spaceId,
      hostId,
      guestId
    })
  )
  if (!spaceState) {
    throw new Error('SpaceCoreFixture: spaceState is null')
  }
  const ctx: SpaceCtx = {
    space: spaceState
  }
  return {
    ctx,
    spaceId,
    hostId,
    guestId,
    space: spaceState
  }
}
