import type { Task } from '~/@/promise/task'
import type { Profile } from '~/app/@/data/profile'
import type { UserId } from '~/app/@/data/user-id'

export type IProfileCache = {
  add: (profiles: { [userId: UserId]: Profile }) => Task<string, null>
  get: (userIds: UserId[]) => Task<string, { [userId: UserId]: Profile }>
}
