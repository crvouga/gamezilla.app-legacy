import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'

const hostUserId = 'test-user-id' as UserId

const currentSpaceId = 'test-space-id' as SpaceId

export const SpaceGameSpaceFixture = async () => {
  const ctx: SpaceCtx = {
    space: {
      hostId: hostUserId,
      spaceId: currentSpaceId,
      users: {
        [hostUserId]: hostUserId,
      },
      visibility: 'public',
    },
  }

  return {
    ctx,
  }
}
