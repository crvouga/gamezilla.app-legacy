import { EventId, WithEventId } from '~/@/event-sourced/event'
import { Result } from '~/@/result'
import { Paginated } from '~/app/@/data/pagination'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { SpaceSpace } from '../space'
import { SpaceEvent } from '../space-event'
import { Pagination } from '~/@/query/query'

export type SpaceBackendWhereAnd = {
  equalsSpaceId?: SpaceId
  equalsUserId?: UserId
}

export type ISpaceBackend = {
  list: (input: {
    pagination: Pagination
    whereAnd?: SpaceBackendWhereAnd
  }) => Promise<Result<string, Paginated<SpaceSpace.Model>>>

  get: (spaceId: SpaceId | null) => Promise<Result<string, SpaceSpace.Model | null>>

  getByUserId: (userId: UserId | null) => Promise<Result<string, SpaceSpace.Model | null>>

  upsert: (space: SpaceSpace.Model) => Promise<Result<string, null>>

  hasEvent: (spaceId: SpaceId, eventId: EventId) => Promise<boolean>

  update: (spaceEvent: WithEventId<SpaceEvent>) => Promise<Result<string, null>>

  merge: (space: SpaceSpace.Model) => Promise<Result<string, null>>
}
