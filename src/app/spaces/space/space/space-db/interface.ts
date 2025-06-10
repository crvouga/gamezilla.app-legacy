import { Result } from '~/@/result'
import { PubSub, Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '..'

export type SpaceDbQueryInput = {
  where: {
    spaceId?: {
      '=': SpaceId
    }
    hostId?: {
      '=': UserId
    }
  }
  limit?: number
  offset?: number
}

export type ISpaceDb = {
  query: (query: SpaceDbQueryInput) => Promise<Result<string, Paginated<Space.Model>>>
  sub: <T>(input: SpaceDbQueryInput, map: (spaces: Space.Model[]) => T) => Sub<T>
  upsert: (space: Space.Model) => Promise<Result<string, null>>
}

export type SpaceDbInputMsg = { t: 'dangerously-override-model'; model: Space.Model }
export type SpaceDbOutputMsg = { t: 'model-dangerously-overridden'; model: Space.Model }
export type SpaceDbConfig = { input?: Sub<SpaceDbInputMsg>; output?: PubSub<SpaceDbOutputMsg> }
