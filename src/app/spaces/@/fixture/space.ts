import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../../space/space/space'
import { SpaceCtx } from '../space/ctx'
import { makeSpace } from './shared'

export const FixtureSpace = async () => {
  const spaceId = SpaceId.generate()
  const hostId = UserId.generate()
  const guestId = UserId.generate()
  const spaceState = Space.toSpaceStarted(makeSpace({ spaceId, hostId, guestId }))
  if (!spaceState) throw new Error('SpaceFixture: spaceState is null')
  const ctx: SpaceCtx = { space: spaceState }
  return {
    ctx,
    spaceId,
    hostId,
    guestId,
    space: spaceState,
  }
}
