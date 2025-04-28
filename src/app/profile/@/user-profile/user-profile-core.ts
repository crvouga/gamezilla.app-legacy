import { Posix } from '~/@/time/posix'
import { ProfileAvatar, ProfileAvatarSeed, ProfileAvatarStyle } from '~/app/@/data/profile-avatar'
import { UserId } from '~/app/@/data/user-id'
import { Username } from '~/app/@/data/username'
import { UserProfileId } from './user-profile-id'

export type ProfileCore = {
  id: UserProfileId
  userId: UserId
  username: Username
  avatarSeed: ProfileAvatarSeed | null
  avatarStyle: ProfileAvatarStyle | null
  createdAt: Posix
  updatedAt: Posix
}

const random = async (overrides?: Partial<ProfileCore>): Promise<ProfileCore> => {
  return {
    id: UserProfileId.generate(),
    userId: UserId.generate(),
    username: await Username.generate(),
    avatarSeed: ProfileAvatar.randomSeed(),
    avatarStyle: ProfileAvatar.randomStyle(),
    createdAt: Posix.now(),
    updatedAt: Posix.now(),
    ...overrides,
  }
}

export const ProfileCore = {
  random,
}
