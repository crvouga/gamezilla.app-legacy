import { p } from '~/@/parser'
import { Posix } from '~/@/time/posix'
import { ProfileAvatar } from '~/app/@/data/profile-avatar'
import { UserId } from '~/app/@/data/user-id'
import { Username } from '~/app/@/data/username'

const parser = p.obj({
  id: UserId,
  username: Username,
  avatarSeed: p.maybe(p.str),
  avatarStyle: p.maybe(p.str),
  createdAt: Posix,
  updatedAt: Posix,
})

export type Profile = p.Infer<typeof parser>

const random = async (overrides?: Partial<Profile>): Promise<Profile> => {
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

const toAvatarUrl = (profile?: Profile | null | undefined): string => {
  if (!profile) {
    return ''
  }
  return ProfileAvatar.toUrl({
    seed: profile.avatarSeed ?? '',
    style: 'thumbs',
  })
}

const indexByUserId = (profiles: Profile[]): { [userId: UserId]: Profile } => {
  return profiles.reduce<{ [userId: UserId]: Profile }>((acc, profile) => {
    acc[profile.id] = profile
    return acc
  }, {})
}

export const Profile = {
  ...parser,
  random,
  toAvatarUrl,
  indexByUserId,
}
