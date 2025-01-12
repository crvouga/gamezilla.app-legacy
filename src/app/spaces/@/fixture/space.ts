import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { SpaceSpace } from '../../space/space'
import { SpaceCtx } from '../space/ctx'
import { makeSpace } from './shared'

export const SpaceSpaceFixture = async () => {
  const spaceId = SpaceId.generate()
  const hostId = UserId.generate()
  const guestId = UserId.generate()
  const spaceState = SpaceSpace.toSpaceStarted(
    makeSpace({
      spaceId,
      hostId,
      guestId,
    }),
  )
  if (!spaceState) {
    throw new Error('SpaceSpaceFixture: spaceState is null')
  }
  const ctx: SpaceCtx = {
    space: spaceState,
  }
  return {
    ctx,
    spaceId,
    hostId,
    guestId,
    space: spaceState,
  }
}
