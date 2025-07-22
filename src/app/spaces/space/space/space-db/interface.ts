import { Result } from '~/@/result'
import { PubSub, Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { Space } from '../space'
import { SpaceDbQuery } from './interface-query'

export type ISpaceDb = {
  query: (query: SpaceDbQuery) => Promise<Result<string, Paginated<Space>>>
  sub: <T>(input: SpaceDbQuery, map: (spaces: Space[]) => T) => Sub<T>
  upsert: (space: Space) => Promise<Result<string, null>>
  input: PubSub<SpaceDbInputMsg>
  output: PubSub<SpaceDbOutputMsg>
}

export type SpaceDbInputMsg = { t: 'dangerously-override-model'; model: Space }
export type SpaceDbOutputMsg = { t: 'model-dangerously-overridden'; model: Space }
export type SpaceDbConfig = { input?: PubSub<SpaceDbInputMsg>; output?: PubSub<SpaceDbOutputMsg> }
