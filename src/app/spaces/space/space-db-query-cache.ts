import { indexBy } from '~/@/array/index-by'
import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { Sub } from '~/@/sub'
import { SpaceId } from '~/app/@/data/space-id'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import { QueryCache } from '~/app/frontend/query-cache/query-cache'
import { Space } from './space'
import { ISpaceDb } from './space-db/interface'
import { SpaceDbQuery } from './space-db/interface-query'

const sub = <TMsg>(spaceDb: ISpaceDb, query: SpaceDbQuery, mapper: (m: unknown) => TMsg): Sub<TMsg> => {
  return spaceDb.sub(query, (spaces) => {
    return mapper(
      GotQueryCacheMsg.init({
        entities: indexBy(spaces, (c) => Space.toSpaceId(c) ?? ''),
        query,
        results: spaces.map((c) => Space.toSpaceId(c) ?? ''),
        t: 'got-entities',
        lastUpdatedAtKey: Space.key('lastUpdatedAt'),
      }),
    )
  })
}

const read = (ctx: { queryCache: QueryCache }, query: SpaceDbQuery): Space[] => {
  const queryKey = deterministicJsonStringify(query)
  const results = ctx.queryCache.results[queryKey]
  const entities = (results?.map((id) => ctx.queryCache.entities[id] as Space) ?? []).filter((space) => {
    const spaceProjection = Space.toSpaceProjection(space)
    return spaceProjection?.type === 'started'
  })
  return entities
}

const isLoading = (ctx: { queryCache: QueryCache }, query: SpaceDbQuery): boolean => {
  const queryKey = deterministicJsonStringify(query)
  return ctx.queryCache.results[queryKey] === undefined
}

const isEmpty = (ctx: { queryCache: QueryCache }, query: SpaceDbQuery): boolean => {
  const spaces = read(ctx, query)
  return !isLoading(ctx, query) && spaces.length === 0
}

const entity = (ctx: { queryCache: QueryCache }, spaceId: SpaceId): Space | null => {
  return ctx.queryCache.entities[spaceId] as Space | null
}

export const SpaceDbQueryCache = {
  sub,
  read,
  isLoading,
  isEmpty,
  entity,
}
