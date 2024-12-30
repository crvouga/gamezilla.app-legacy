import type { Profile, UserId } from '~/app/@/data'
import type { Task } from '~/@/promise/task'

export type IProfileCache = {
  add: (profiles: { [userId: UserId]: Profile }) => Task<string, null>
  get: (userIds: UserId[]) => Task<string, { [userId: UserId]: Profile }>
}
