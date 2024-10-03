import type { Task } from 'gamezilla-app/@/core'
import type { SpaceId, UserId } from 'gamezilla-app/app/@/data'
import { EventId } from 'gamezilla-app/app/spaces/@/event'
import type * as SpaceCore from '../../space-core'

export type SpacesDbWhere = {
  spaceId?: SpaceId
  userId?: UserId
}

export type ISpacesDb = {
  list: (input: { limit: number; offset: number; where?: SpacesDbWhere }) => Task<string, SpaceCore.Model[]>

  get: (spaceId: SpaceId | null) => Task<string, SpaceCore.Model | null>

  getByUserId: (userId: UserId) => Task<string, SpaceCore.Model | null>

  upsert: (space: SpaceCore.Model) => Task<string, null>

  hasEvent: (spaceId: SpaceId, eventId: EventId) => Task<string, boolean>
}
