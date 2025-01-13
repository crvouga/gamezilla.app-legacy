import { Profile } from '~/app/@/data/profile'
import { UserId } from '~/app/@/data/user-id'

export type ModelFrontendBase = {
  'profile.profiles'?: {
    [userId: UserId]: Profile
  }
}
