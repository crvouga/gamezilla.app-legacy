import type { Task } from 'gamezilla-app/@/core'
import type { SpaceId, UserId } from 'gamezilla-app/app/@/data'
import { EventId, WithEventId, WithEventMeta } from 'gamezilla-app/app/spaces/@/event'
import type * as SpaceCore from '../space-core'
import { SpaceCoreEvent } from '../space-core-event'

export type SpacesCoreServerWhereAnd = {
  spaceId?: SpaceId
  userId?: UserId
}

export type ISpacesCoreServer = {
  list: (input: {
    limit: number
    offset: number
    whereAnd?: SpacesCoreServerWhereAnd
  }) => Task<string, SpaceCore.Model[]>

  get: (spaceId: SpaceId | null) => Task<string, SpaceCore.Model | null>

  getWithFallback: (spaceId: SpaceId | null) => Promise<SpaceCore.Model>

  getByUserId: (userId: UserId) => Task<string, SpaceCore.Model | null>

  upsert: (space: SpaceCore.Model) => Task<string, null>

  hasEvent: (spaceId: SpaceId, eventId: EventId) => Promise<boolean>

  update: (spaceEvent: WithEventId<SpaceCoreEvent>) => Task<string, null>

  merge: (space: SpaceCore.Model) => Task<string, null>

  getEvent: (spaceId: SpaceId, eventId: EventId) => Task<string, WithEventMeta<SpaceCoreEvent> | null>
}
