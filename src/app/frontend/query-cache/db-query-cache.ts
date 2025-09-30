import { indexBy } from '~/@/array/index-by'
import { IDb } from '~/@/db/interface'
import { QueryInput } from '~/@/db/interface/query-input/query-input'
import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { isOk } from '~/@/result'
import { s } from '~/@/schema'
import { Sub } from '~/@/sub'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import { QueryCache } from '.'

const init = <TEntity extends Record<string, unknown>, TRelated extends Record<string, unknown>>(config: {
  entityType: string
  lastUpdatedAtKey: keyof TEntity
  primaryKey: keyof TEntity
  entity: s.Schema<TEntity>
  related: s.Schema<TRelated>
}) => {
  type Db = IDb.IDb<TEntity, TRelated>

  const watch = <TMsg>(db: Db, queryInput: QueryInput<TEntity>, mapper: (m: unknown) => TMsg): Sub<TMsg> => {
    return db.liveQuery(queryInput, (result) => {
      return mapper(
        GotQueryCacheMsg.init({
          entities: isOk(result) ? indexBy(result.value.entities.items, (c) => String(c[config.primaryKey])) : {},
          query: queryInput,
          results: isOk(result) ? result.value.entities.items.map((c) => String(c[config.primaryKey])) : [],
          t: 'got-entities',
          entityType: config.entityType,
          lastUpdatedAtKey: String(config.lastUpdatedAtKey),
        }),
      )
    })
  }

  const query = (ctx: { queryCache: QueryCache.Model }, queryInput: QueryInput<TEntity>): TEntity[] => {
    const queryKey = deterministicJsonStringify(queryInput)
    const results = ctx.queryCache.queryCache_results[queryKey]
    const entities =
      results?.map((id) => ctx.queryCache.queryCache_entities.byType[config.entityType]?.byId[id] as TEntity) ?? []
    return entities
  }

  const toEntity = (ctx: { queryCache: QueryCache.Model }, id: string): TEntity | null => {
    const entity = ctx.queryCache.queryCache_entities.byType[config.entityType]?.byId[id] as TEntity
    return entity ?? null
  }

  const isLoading = (ctx: { queryCache: QueryCache.Model }, queryInput: QueryInput<TEntity>): boolean => {
    const queryKey = deterministicJsonStringify(queryInput)
    return ctx.queryCache.queryCache_results[queryKey] === undefined
  }

  const isEmpty = (ctx: { queryCache: QueryCache.Model }, queryInput: QueryInput<TEntity>): boolean => {
    const entities = query(ctx, queryInput)
    return !isLoading(ctx, queryInput) && entities.length === 0
  }

  const gotEntity = (entityId: string, entityNew: TEntity): GotQueryCacheMsg => {
    return GotQueryCacheMsg.init({
      t: 'got-entity',
      entityType: config.entityType,
      id: entityId,
      entity: entityNew,
      lastUpdatedAtKey: String(config.lastUpdatedAtKey),
    })
  }

  return {
    toEntity,
    gotEntity,
    watch,
    query,
    isLoading,
    isEmpty,
  }
}

export const DbQueryCache = {
  init,
}
