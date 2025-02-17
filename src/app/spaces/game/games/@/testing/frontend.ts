import { Posix } from '~/@/time/posix'
import { ProfileAvatar } from '~/app/@/data/profile-avatar'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Username } from '~/app/@/data/username'
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
    profiles: {
      [currentUserId]: {
        avatarUrl: ProfileAvatar.toUrl({
          seed: ProfileAvatar.randomSeed(),
          style: 'fun-emoji',
        }),
        userId: currentUserId,
        username: await Username.generate(),
      },
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
