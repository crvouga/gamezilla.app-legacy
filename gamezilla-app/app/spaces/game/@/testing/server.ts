import { type SpaceId, type UserId } from 'gamezilla-app/app/@/data'
import type { SpaceServerCtx } from '../../../@/space'
import { AppServerFixture } from 'gamezilla-app/app/@/server/server-test-env'

export const SpaceGameFixtureServer = async () => {
  const f = await AppServerFixture()

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
