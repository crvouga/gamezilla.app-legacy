import { Profile, UserId } from "gamezilla-app/app/@shared/data"
import { Task } from "gamezilla-app/@shared/core"

export type IProfileCache = {
  add: (profiles: { [userId: UserId]: Profile }) => Task<string, null>
  get: (userIds: UserId[]) => Task<string, { [userId: UserId]: Profile }>
}
