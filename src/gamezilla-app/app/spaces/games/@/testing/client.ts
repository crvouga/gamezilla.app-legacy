import { PhoneNumber, Posix } from '@/core'
import { Translator } from 'gamezilla-app/app/@/client/translator'
import { ProfileAvatar, Username, type SpaceId, type UserId } from 'gamezilla-app/app/@/data'
import { UserAccount } from 'gamezilla-app/app/@/data/account'
import { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space-client-ctx'

const currentUserId = 'test-user-id' as UserId

const currentSpaceId = 'test-space-id' as SpaceId

export async function testSpaceClientCtx(): Promise<SpaceClientCtx> {
  const currentUser: UserAccount = {
    createdAt: Posix.now(),
    phoneNumber: PhoneNumber.random(),
    role: 'normal',
    userId: currentUserId
  }
  return {
    currentUser,
    navigatorLanguage: 'en',
    t: Translator('en'),
    currentRoute: {
      n: 'spaces',
      t: 'space',
      spaceId: currentSpaceId
    },
    currentUserId,
    currentUserRole: 'normal',
    documentVisibilityState: 'visible',
    now: Posix.now(),
    profiles: {
      [currentUserId]: {
        avatarUrl: ProfileAvatar.toUrl({
          seed: ProfileAvatar.generateRandomSeed(),
          style: 'fun-emoji'
        }),
        userId: currentUserId,
        username: await Username.generate()
      }
    },
    space: {
      hostId: currentUserId,
      spaceId: currentSpaceId,
      users: {
        [currentUserId]: currentUserId
      },
      visibility: 'public'
    }
  }
}
