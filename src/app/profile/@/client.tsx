import { Profile, UserId } from '~/app/@/data'

export type ModelClientBase = {
  'profile.profiles'?: {
    [userId: UserId]: Profile
  }
}
