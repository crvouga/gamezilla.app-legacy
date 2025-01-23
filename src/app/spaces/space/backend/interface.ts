import { EventId, WithEventId } from '~/@/event-sourced/event'
import { Pagination } from '~/@/query/query'
import { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../space'
import { SpaceEvent } from '../space-event'

export type ISpaceBackend = {
  list: (input: {
    pagination: Pagination
    whereAnd?: SpaceBackendWhereAnd
  }) => Promise<Result<string, Paginated<Space.Model>>>

  get: (spaceId: SpaceId | null) => Promise<Result<string, Space.Model | null>>

  getByUserId: (userId: UserId | null) => Promise<Result<string, Space.Model | null>>

  upsert: (space: Space.Model) => Promise<Result<string, null>>

  hasEvent: (spaceId: SpaceId, eventId: EventId) => Promise<boolean>

  update: (spaceEvent: WithEventId<SpaceEvent>) => Promise<Result<string, null>>

  merge: (space: Space.Model) => Promise<Result<string, null>>
}

export type SpaceBackendWhereAnd = {
  equalsSpaceId?: SpaceId
  equalsUserId?: UserId
}

export type SpaceBackendConfig = {
  /**
   * This is used for testing purposes only. Testing invalid data
   */
  _dangerouslyOverrideModel?: Sub<Space.Model>
}
