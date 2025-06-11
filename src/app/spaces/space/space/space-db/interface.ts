import { Result } from '~/@/result'
import { PubSub, Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { Space } from '..'
import { SpaceQuery } from './query'

export type ISpaceDb = {
  query: (query: SpaceQuery) => Promise<Result<string, Paginated<Space.Model>>>
  sub: <T>(input: SpaceQuery, map: (spaces: Space.Model[]) => T) => Sub<T>
  upsert: (space: Space.Model) => Promise<Result<string, null>>
}

export type SpaceDbInputMsg = { t: 'dangerously-override-model'; model: Space.Model }
export type SpaceDbOutputMsg = { t: 'model-dangerously-overridden'; model: Space.Model }
export type SpaceDbConfig = { input?: Sub<SpaceDbInputMsg>; output?: PubSub<SpaceDbOutputMsg> }
