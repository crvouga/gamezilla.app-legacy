import { PhoneNumber } from '~/@/phone-number'
import { Posix } from '~/@/time/posix'
import { Translator } from '~/app/@/frontend/translator'
import { UserAccount } from '~/app/@/data/account'
import { ProfileAvatar } from '~/app/@/data/profile-avatar'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Username } from '~/app/@/data/username'
import { SpaceFrontendCtx } from '~/app/spaces/@/space-frontend/ctx'

const currentUserId = 'test-user-id' as UserId

const currentSpaceId = 'test-space-id' as SpaceId

export async function testSpaceFrontendCtx(): Promise<SpaceFrontendCtx> {
  const currentUser: UserAccount = {
    createdAt: Posix.now(),
    phoneNumber: PhoneNumber.random(),
    role: 'normal',
    userId: currentUserId,
  }
  return {
    currentUser,
    navigatorLanguage: 'en',
    t: Translator('en'),
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
          seed: ProfileAvatar.generateRandomSeed(),
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
