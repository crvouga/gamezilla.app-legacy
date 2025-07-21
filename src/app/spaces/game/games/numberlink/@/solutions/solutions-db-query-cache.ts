import { indexBy } from '~/@/array/index-by'
import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { Sub } from '~/@/sub'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import { QueryCache } from '~/app/frontend/query-cache/query-cache'
import { Solution } from './solution'
import { SolutionHash } from './solution-hash/solution-hash'
import { ISolutionsDb } from './solutions-db/interface'

type Query = {
  solutionHash: SolutionHash | null
}
const initQuery = (solutionHash: SolutionHash | null): Query => {
  return { solutionHash }
}

const sub = <TMsg>(
  solutionsDb: ISolutionsDb,
  solutionHash: SolutionHash | null,
  mapper: (m: unknown) => TMsg,
): Sub<TMsg> => {
  if (!solutionHash) return Sub.none()
  const query = initQuery(solutionHash)
  return solutionsDb.sub(solutionHash, (solutions) => {
    return mapper(
      GotQueryCacheMsg.init({
        entities: indexBy(solutions, SolutionHash.init),
        query,
        results: solutions.map(SolutionHash.init),
        t: 'got-entities',
      }),
    )
  })
}

const read = (ctx: { queryCache: QueryCache }, solutionHash: SolutionHash | null): Solution[] => {
  const query = initQuery(solutionHash)
  const queryKey = deterministicJsonStringify(query)
  const results = ctx.queryCache.results[queryKey] as SolutionHash[]
  if (!results) return []
  return results.map((solutionHash) => ctx.queryCache.entities[solutionHash] as Solution)
}

const entity = (ctx: { queryCache: QueryCache }, solutionHash: SolutionHash | null): Solution | null => {
  if (!solutionHash) return null
  const query = initQuery(solutionHash)
  const queryKey = deterministicJsonStringify(query)
  const entity = ctx.queryCache.entities[queryKey] as Solution
  if (!entity) return null
  return entity
}

const isLoading = (ctx: { queryCache: QueryCache }, solutionHash: SolutionHash | null): boolean => {
  const query = initQuery(solutionHash)
  const queryKey = deterministicJsonStringify(query)
  return ctx.queryCache.results[queryKey] === undefined
}

const isEmpty = (ctx: { queryCache: QueryCache }, solutionHash: SolutionHash | null): boolean => {
  const solutions = read(ctx, solutionHash)
  return !isLoading(ctx, solutionHash) && solutions.length === 0
}

export const SolutionsDbQueryCache = {
  sub,
  entity,
  read,
  isLoading,
  isEmpty,
}
