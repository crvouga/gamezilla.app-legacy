import { Profile, UserId } from 'gamezilla-app/app/@/data'

export type ModelClientBase = {
  'profile.profiles'?: {
    [userId: UserId]: Profile
  }
}
