import { s } from '~/@/schema'
import { Posix } from '~/@/time/posix'
import { ProfileAvatar } from '~/app/@/data/profile-avatar'
import { UserId } from '~/app/@/data/user-id'
import { Username } from '~/app/@/data/username'

const schema = s.obj({
  id: UserId,
  username: Username,
  avatarSeed: s.maybe(s.str),
  avatarStyle: s.maybe(s.str),
  createdAt: Posix,
  updatedAt: Posix,
})

export type UserProfile = s.Infer<typeof schema>

const random = async (overrides?: Partial<UserProfile>): Promise<UserProfile> => {
  return {
    id: UserId.generate(),
    username: await Username.generate(),
    avatarSeed: ProfileAvatar.randomSeed(),
    avatarStyle: ProfileAvatar.randomStyle(),
    createdAt: Posix.now(),
    updatedAt: Posix.now(),
    ...overrides,
  }
}

const toAvatarUrl = (profile?: UserProfile | null | undefined): string => {
  if (!profile) {
    return ''
  }
  return ProfileAvatar.toUrl({
    seed: profile.avatarSeed ?? '',
    style: 'thumbs',
  })
}

const indexByUserId = (profiles: UserProfile[]): { [userId: UserId]: UserProfile } => {
  return profiles.reduce<{ [userId: UserId]: UserProfile }>((acc, profile) => {
    acc[profile.id] = profile
    return acc
  }, {})
}

export const UserProfile = {
  ...schema,
  random,
  toAvatarUrl,
  indexByUserId,
}
