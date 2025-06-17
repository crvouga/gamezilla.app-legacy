import { Result } from '~/@/result'
import { PubSub, Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { Space } from '..'
import { SpaceDbQuery } from './inteface-query'

export type ISpaceDb = {
  query: (query: SpaceDbQuery) => Promise<Result<string, Paginated<Space.Model>>>
  sub: <T>(input: SpaceDbQuery, map: (spaces: Space.Model[]) => T) => Sub<T>
  upsert: (space: Space.Model) => Promise<Result<string, null>>
  input: PubSub<SpaceDbInputMsg>
  output: PubSub<SpaceDbOutputMsg>
}

export type SpaceDbInputMsg = { t: 'dangerously-override-model'; model: Space.Model }
export type SpaceDbOutputMsg = { t: 'model-dangerously-overridden'; model: Space.Model }
export type SpaceDbConfig = { input?: PubSub<SpaceDbInputMsg>; output?: PubSub<SpaceDbOutputMsg> }
