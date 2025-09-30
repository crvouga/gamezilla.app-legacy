import { indexBy } from '~/@/array/index-by'
import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { Sub } from '~/@/sub'
import { SpaceId } from '~/app/@/data/space-id'
import { QueryCache } from '~/app/frontend/query-cache'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import { Space } from './space'
import { ISpaceDb } from './space-db/interface'
import { SpaceDbQuery } from './space-db/interface-query'

const ENTITY_TYPE = 'space'

const sub = <TMsg>(spaceDb: ISpaceDb, query: SpaceDbQuery, mapper: (m: unknown) => TMsg): Sub<TMsg> => {
  return spaceDb.sub(query, (spaces) => {
    return mapper(
      GotQueryCacheMsg.init({
        entities: indexBy(spaces, (c) => Space.toSpaceId(c) ?? ''),
        query,
        results: spaces.map((c) => Space.toSpaceId(c) ?? ''),
        t: 'got-entities',
        entityType: 'space',
        lastUpdatedAtKey: Space.key('lastUpdatedAt'),
      }),
    )
  })
}

const read = (ctx: { queryCache: QueryCache.Model }, query: SpaceDbQuery): Space[] => {
  const queryKey = deterministicJsonStringify(query)
  const results = ctx.queryCache.queryCache_results[queryKey]
  const entities = (
    results?.map((id) => ctx.queryCache.queryCache_entities.byType['space']?.byId[id] as Space) ?? []
  ).filter((space) => {
    const spaceProjection = Space.toSpaceProjection(space)
    return spaceProjection?.type === 'started'
  })
  return entities
}

const isLoading = (ctx: { queryCache: QueryCache.Model }, query: SpaceDbQuery): boolean => {
  const queryKey = deterministicJsonStringify(query)
  return ctx.queryCache.queryCache_results[queryKey] === undefined
}

const isEmpty = (ctx: { queryCache: QueryCache.Model }, query: SpaceDbQuery): boolean => {
  const spaces = read(ctx, query)
  return !isLoading(ctx, query) && spaces.length === 0
}

const entity = (ctx: { queryCache: QueryCache.Model }, spaceId: SpaceId): Space | null => {
  return ctx.queryCache.queryCache_entities.byType[ENTITY_TYPE]?.byId[spaceId] as Space | null
}

const gotEntity = (spaceId: SpaceId, spaceNew: Space): GotQueryCacheMsg => {
  return GotQueryCacheMsg.init({
    t: 'got-entity',
    id: spaceId,
    entityType: ENTITY_TYPE,
    entity: spaceNew,
    lastUpdatedAtKey: Space.key('lastUpdatedAt'),
  })
}

export const SpaceDbQueryCache = {
  gotEntity,
  sub,
  read,
  isLoading,
  isEmpty,
  entity,
}
