import type { Task } from '~/@/promise/task'
import type { UserProfile } from '~/app/@/data/user-profile'
import type { UserId } from '~/app/@/data/user-id'

export type IProfileCache = {
  add: (profiles: UserProfile[]) => Task<string, null>
  getByUserId: (userIds: UserId[]) => Task<string, UserProfile[]>
}
