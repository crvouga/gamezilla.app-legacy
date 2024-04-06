import { SpaceId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Task } from "gamezilla-app/@SHARED/core"
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

  upsert: (space: Space.Model) => Task<string, null>
}
