import { Profile, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Task } from "gamezilla-app/@SHARED/core"

export type ProfileCache = {
  add: (profiles: { [userId: UserId]: Profile }) => Task<string, null>
  get: (userIds: UserId[]) => Task<string, { [userId: UserId]: Profile }>
}
