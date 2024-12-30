import { p } from '~/@/parser'
import { UserId } from './user-id'
import { Username } from './username'
import { ProfileAvatar } from './profile-avatar'

const parser = p.obj({
  userId: p.custom(UserId.is, 'Invalid user id'),
  avatarUrl: p.str,
  username: p.custom(Username.is, 'Invalid username')
})
export type Profile = p.Infer<typeof parser>

const random = async (): Promise<Profile> => {
  return {
    userId: UserId.generate(),
    avatarUrl: ProfileAvatar.toUrl({
      seed: ProfileAvatar.toSeed('random avatar seed'),
      style: 'adventurer'
    }),
    username: await Username.generate()
  }
}

const indexByUserId = (profiles: Profile[]): { [userId: UserId]: Profile } => {
  const result: { [userId: UserId]: Profile } = {}
  for (const profile of profiles) {
    result[profile.userId] = profile
  }
  return result
}

export const Profile = {
  ...parser,
  random,
  indexByUserId
}
