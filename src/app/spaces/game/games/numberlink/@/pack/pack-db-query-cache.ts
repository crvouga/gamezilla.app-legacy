import { indexBy } from '~/@/array/index-by'
import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { Sub } from '~/@/sub'
import { QueryCache } from '~/app/frontend/query-cache'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import { Pack } from './pack'
import { IPackDb } from './pack-db/interface'
import { PackQuery } from './pack-db/interface-query'
import { PackId } from './pack-id'

const ENTITY_TYPE = 'game-numberlink-pack'

const sub = <TMsg>(packDb: IPackDb, query: PackQuery, mapper: (m: unknown) => TMsg): Sub<TMsg> => {
  return packDb.sub(query, (packs) => {
    return mapper(
      GotQueryCacheMsg.init({
        entities: indexBy(packs, (c) => c.id),
        query,
        results: packs.map((c) => c.id),
        t: 'got-entities',
        entityType: ENTITY_TYPE,
        lastUpdatedAtKey: Pack.key('lastUpdatedAt'),
      }),
    )
  })
}

const read = (ctx: { queryCache: QueryCache.Model }, query: PackQuery): Pack[] => {
  const queryKey = deterministicJsonStringify(query)
  const results = ctx.queryCache.queryCache_results[queryKey]
  const entities = results?.map((id) => ctx.queryCache.queryCache_entities.byType[ENTITY_TYPE]?.byId[id] as Pack) ?? []
  return entities
}

const isLoading = (ctx: { queryCache: QueryCache.Model }, query: PackQuery): boolean => {
  const queryKey = deterministicJsonStringify(query)
  return ctx.queryCache.queryCache_results[queryKey] === undefined
}

const isEmpty = (ctx: { queryCache: QueryCache.Model }, query: PackQuery): boolean => {
  const packs = read(ctx, query)
  return !isLoading(ctx, query) && packs.length === 0
}

const gotEntity = (packId: PackId, packNew: Pack): GotQueryCacheMsg => {
  return GotQueryCacheMsg.init({
    t: 'got-entity',
    entityType: ENTITY_TYPE,
    id: packId,
    entity: packNew,
    lastUpdatedAtKey: Pack.key('lastUpdatedAt'),
  })
}

export const PackDbQueryCache = {
  gotEntity,
  sub,
  read,
  isLoading,
  isEmpty,
}
