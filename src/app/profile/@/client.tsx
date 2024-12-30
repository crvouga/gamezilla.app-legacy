import { Profile } from '~/app/@/data/profile'
import { UserId } from '~/app/@/data/user-id'

export type ModelClientBase = {
  'profile.profiles'?: {
    [userId: UserId]: Profile
  }
}
