import { Result } from '~/@/result'
import type { Paginated, SpaceId, UserId } from '~/app/@/data'
import { EventId, WithEventId } from '~/@/event-sourced/event'
import type * as SpaceCore from '../space-core'
import { SpaceEvent } from '../space-event'

export type SpacesCoreServerWhereAnd = {
  equalsSpaceId?: SpaceId
  equalsUserId?: UserId
}

export type ISpacesCoreServer = {
  list: (input: {
    limit: number
    offset: number
    whereAnd?: SpacesCoreServerWhereAnd
  }) => Promise<Result<string, Paginated<SpaceCore.Model>>>

  get: (spaceId: SpaceId | null) => Promise<Result<string, SpaceCore.Model | null>>

  getByUserId: (userId: UserId | null) => Promise<Result<string, SpaceCore.Model | null>>

  upsert: (space: SpaceCore.Model) => Promise<Result<string, null>>

  hasEvent: (spaceId: SpaceId, eventId: EventId) => Promise<boolean>

  update: (spaceEvent: WithEventId<SpaceEvent>) => Promise<Result<string, null>>

  merge: (space: SpaceCore.Model) => Promise<Result<string, null>>
}
