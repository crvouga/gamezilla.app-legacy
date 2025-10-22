import { IDb } from '~/@/db/interface'
import { QueryInput } from '~/@/db/interface/query-input/query-input'
import { QueryOutput } from '~/@/db/interface/query-output/query-output'
import { UpsertInput } from '~/@/db/interface/upsert-input/upsert-input'
import { UpsertOutput } from '~/@/db/interface/upsert-output/upsert-output'
import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../space'

// Define a virtual entity schema for querying purposes
// The actual Space entity is event-sourced, but we want to query by projection fields
const SpaceQueryEntity = s.obj({
  id: SpaceId,
  hostId: UserId,
  type: s.enumeration(['initial', 'started', 'ended'] as const),
  userIds: s.arr(UserId),
})

type SpaceQueryEntity = s.Infer<typeof SpaceQueryEntity>

const schema = IDb.schema({
  Entity: SpaceQueryEntity,
  Related: s.partialObj({}),
})

// Override the IDb type to use the actual Space entity in inputs/outputs
export type ISpaceDb = {
  query: (query: QueryInput<SpaceQueryEntity>) => Promise<QueryOutput<Space, {}>>
  liveQuery: <TMsg>(
    query: QueryInput<SpaceQueryEntity>,
    map: (output: QueryOutput<Space, {}>) => TMsg,
  ) => import('~/@/sub').Sub<TMsg>
  upsert: (input: UpsertInput<Space>) => Promise<UpsertOutput<Space>>
  update: IDb.IDb<SpaceQueryEntity, {}>['update']
  delete: IDb.IDb<SpaceQueryEntity, {}>['delete']
  extra: unknown
}

export const ISpaceDb = {
  schema,
}
