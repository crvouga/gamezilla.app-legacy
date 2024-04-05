import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Task } from "gamezilla-app/@SHARED/core"
import * as Space from "../space"

export type SpacesDb = {
  get: (spaceId: SpaceId) => Task<string, Space.Model | null>
  list: (input: {
    limit: number
    offset: number
    where?: {
      spaceId?: {
        equals?: SpaceId
      }
      userId?: {
        includes?: string
      }
    }
  }) => Task<string, Space.Model[]>
  upsert: (space: Space.Model) => Task<string, null>
}
