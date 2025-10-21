import { Sub } from '~/@/sub'
import { UserId } from '../@/data/user-id'

export type ProfileCmd = {
  t: 'openProfile'
  userId: UserId
}

export const profileCmds = Sub.queued<ProfileCmd>()
