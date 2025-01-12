import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { FixtureAppBackend } from '~/app/@/server/fixture'
import { SpaceBackendCtx } from '~/app/spaces/@/space-server/ctx'

export const SpaceGameFixtureBackend = async () => {
  const f = await FixtureAppBackend()

  const hostUserId = 'test-user-id' as UserId
  const currentSpaceId = 'test-space-id' as SpaceId

  const testSpaceBackendCtx: SpaceBackendCtx = {
    ...f.ctx,

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
    ctx: testSpaceBackendCtx,
  }
}
