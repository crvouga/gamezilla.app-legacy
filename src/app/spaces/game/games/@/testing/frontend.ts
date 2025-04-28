import { Posix } from '~/@/time/posix'
import { Profile } from '~/app/@/data/profile'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'

const currentUserId = 'test-user-id' as UserId

const currentSpaceId = 'test-space-id' as SpaceId

export async function testSpaceFrontendCtx(): Promise<SpaceFrontendCtx> {
  const f = await FixtureAppFrontend()
  return {
    ...f.ctx,
    currentScreen: {
      n: 'spaces',
      t: 'space',
      spaceId: currentSpaceId,
    },
    currentUserId,
    currentUserRole: 'normal',
    documentVisibilityState: 'visible',
    now: Posix.now(),
    profilesByUserId: {
      [currentUserId]: await Profile.random({
        userId: currentUserId,
      }),
    },
    space: {
      hostId: currentUserId,
      spaceId: currentSpaceId,
      users: {
        [currentUserId]: currentUserId,
      },
      visibility: 'public',
    },
  }
}
