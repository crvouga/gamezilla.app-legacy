import { type SpaceId, type UserId } from 'app/@/data'
import { FixtureAppServer } from 'app/@/server/server-test-env'
import { SpaceServerCtx } from 'app/spaces/@/space-server-ctx'

export const SpaceGameFixtureServer = async () => {
  const f = await FixtureAppServer()

  const hostUserId = 'test-user-id' as UserId
  const currentSpaceId = 'test-space-id' as SpaceId

  const testSpaceServerCtx: SpaceServerCtx = {
    ...f.ctx,

    space: {
      hostId: hostUserId,
      spaceId: currentSpaceId,
      users: {
        [hostUserId]: hostUserId
      },
      visibility: 'public'
    }
  }

  return {
    ctx: testSpaceServerCtx
  }
}
