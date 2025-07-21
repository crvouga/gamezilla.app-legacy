import { indexBy } from '~/@/array/index-by'
import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { Sub } from '~/@/sub'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import { QueryCache } from '~/app/frontend/query-cache/query-cache'
import { Pack } from './pack'
import { IPackDb } from './pack-db/interface'
import { PackQuery } from './pack-db/interface-query'

const sub = <TMsg>(packDb: IPackDb, query: PackQuery, mapper: (m: unknown) => TMsg): Sub<TMsg> => {
  return packDb.sub(query, (packs) => {
    return mapper(
      GotQueryCacheMsg.init({
        entities: indexBy(packs, (c) => c.id),
        query,
        results: packs.map((c) => c.id),
        t: 'got-entities',
      }),
    )
  })
}

const read = (ctx: { queryCache: QueryCache }, query: PackQuery): Pack[] => {
  const queryKey = deterministicJsonStringify(query)
  const results = ctx.queryCache.results[queryKey]
  const entities = results?.map((id) => ctx.queryCache.entities[id] as Pack) ?? []
  return entities
}

const isLoading = (ctx: { queryCache: QueryCache }, query: PackQuery): boolean => {
  const queryKey = deterministicJsonStringify(query)
  return ctx.queryCache.results[queryKey] === undefined
}

const isEmpty = (ctx: { queryCache: QueryCache }, query: PackQuery): boolean => {
  const packs = read(ctx, query)
  return !isLoading(ctx, query) && packs.length === 0
}

export const PackDbQueryCache = {
  sub,
  read,
  isLoading,
  isEmpty,
}
