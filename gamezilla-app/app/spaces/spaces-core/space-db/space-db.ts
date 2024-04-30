import { SpaceId, UserId } from "gamezilla-app/app/@shared/data"
import { Task } from "gamezilla-app/@shared/core"
import * as Space from "../space"

export type ISpacesDb = {
  list: (input: {
    limit: number
    offset: number
    where?: {
      spaceId?: SpaceId
      userId?: UserId
    }
  }) => Task<string, Space.Model[]>

  get: (spaceId: SpaceId | null) => Task<string, Space.Model | null>

  getByUserId: (userId: UserId) => Task<string, Space.Model | null>

  upsert: (space: Space.Model) => Task<string, null>
}
