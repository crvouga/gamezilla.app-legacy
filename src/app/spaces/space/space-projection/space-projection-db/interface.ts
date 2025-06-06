import { Pagination } from '~/@/query/query'
import { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../../space'
import { SpaceProjection } from '..'

export type SpaceProjectionQuery = {
  pagination: Pagination
  whereAnd?: SpaceProjectionWhereAnd
}

export type SpaceProjectionWhereAnd = {
  spaceId?: {
    '=': SpaceId | null
  }
  userId?: {
    '=': UserId | null
  }
}

export type ISpaceProjectionDb = {
  query: (input: SpaceProjectionQuery) => Promise<Result<string, Paginated<SpaceProjection.Model>>>
  upsert: (space: SpaceProjection.Model) => Promise<Result<string, null>>
}

export type SpaceProjectionDbConfig = {
  /**
   * This is used for testing purposes only. Testing invalid data
   */
  _dangerouslyOverrideModel?: Sub<Space.Model>
}
