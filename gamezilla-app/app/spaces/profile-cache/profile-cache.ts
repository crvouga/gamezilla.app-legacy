import type { Profile, UserId } from 'gamezilla-app/app/@/data'
import type { Task } from 'gamezilla-app/@/core'

export type IProfileCache = {
  add: (profiles: { [userId: UserId]: Profile }) => Task<string, null>
  get: (userIds: UserId[]) => Task<string, { [userId: UserId]: Profile }>
}
