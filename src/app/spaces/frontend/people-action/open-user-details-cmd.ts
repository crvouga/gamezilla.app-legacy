import { Sub } from '~/@/sub'
import { UserId } from '~/app/@/data/user-id'

export type OpenUserDetailsCmd = {
  t: 'openUserDetails'
  userId: UserId
}

export const openUserDetailsCmds = Sub.queued<OpenUserDetailsCmd>()
