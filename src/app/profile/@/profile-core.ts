import { ProfileAvatar, ProfileAvatarSeed, ProfileAvatarStyle } from '~/app/@/data/profile-avatar'
import { UserId } from '~/app/@/data/user-id'
import { Username } from '~/app/@/data/username'

export type ProfileCore = {
  userId: UserId
  username: Username
  avatarSeed: ProfileAvatarSeed | null
  avatarStyle: ProfileAvatarStyle | null
}

const random = async (): Promise<ProfileCore> => {
  return {
    userId: UserId.generate(),
    username: await Username.generate(),
    avatarSeed: ProfileAvatar.randomSeed(),
    avatarStyle: ProfileAvatar.randomStyle(),
  }
}

export const ProfileCore = {
  random,
}
