import type { Task } from '~/@/promise/task'
import type { Profile } from '~/app/@/data/profile'
import type { UserId } from '~/app/@/data/user-id'

export type IProfileCache = {
  add: (profiles: Profile[]) => Task<string, null>
  getByUserId: (userIds: UserId[]) => Task<string, Profile[]>
}
