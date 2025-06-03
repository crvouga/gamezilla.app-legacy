import { WithEventId } from '~/@/event-sourced/event'
import { Pagination } from '~/@/query/query'
import { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { MsgSpace } from '../../space/msg-space'
import { Space } from '../../space/space'

export type SpacesDbQueryDb = {
  pagination: Pagination
  whereAnd?: SpacesDbWhereAnd
}

export type SpacesDbWhereAnd = {
  equalsSpaceId?: SpaceId | null
  equalsUserId?: UserId | null
}

export type ISpacesDb = {
  query: (input: SpacesDbQueryDb) => Promise<Result<string, Paginated<Space.Model>>>

  upsert: (space: Space.Model) => Promise<Result<string, null>>

  update: (spaceEvent: WithEventId<MsgSpace>) => Promise<Result<string, null>>
}

export type SpacesDbConfig = {
  /**
   * This is used for testing purposes only. Testing invalid data
   */
  _dangerouslyOverrideModel?: Sub<Space.Model>
}
