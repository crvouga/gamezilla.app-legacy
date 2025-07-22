import { indexBy } from '~/@/array/index-by'
import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { Sub } from '~/@/sub'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import { QueryCache } from '~/app/frontend/query-cache/query-cache'
import { Puzzle } from './puzzle'
import { IPuzzleDb } from './puzzle-db/interface'
import { PuzzleQuery } from './puzzle-db/interface-query'
import { PuzzleId } from './puzzle-id'

const sub = <TMsg>(puzzleDb: IPuzzleDb, query: PuzzleQuery, mapper: (m: unknown) => TMsg): Sub<TMsg> => {
  return puzzleDb.sub(query, (puzzles) => {
    return mapper(
      GotQueryCacheMsg.init({
        entities: indexBy(puzzles, (c) => c.id),
        query,
        results: puzzles.map((c) => c.id),
        t: 'got-entities',
      }),
    )
  })
}

const read = (ctx: { queryCache: QueryCache }, query: PuzzleQuery): Puzzle[] => {
  const queryKey = deterministicJsonStringify(query)
  const results = ctx.queryCache.results[queryKey]
  const entities = results?.map((id) => ctx.queryCache.entities[id] as Puzzle) ?? []
  return entities
}

const entity = (ctx: { queryCache: QueryCache }, id: PuzzleId | undefined | null): Puzzle | null => {
  if (!id) return null
  const entity = ctx.queryCache.entities[id]
  if (!entity) return null
  return entity as Puzzle
}

const isLoading = (ctx: { queryCache: QueryCache }, query: PuzzleQuery): boolean => {
  const queryKey = deterministicJsonStringify(query)
  return !Boolean(ctx.queryCache.results[queryKey])
}

const isEmpty = (ctx: { queryCache: QueryCache }, query: PuzzleQuery): boolean => {
  return !isLoading(ctx, query) && read(ctx, query).length === 0
}

export const PuzzleDbQueryCache = {
  sub,
  entity,
  read,
  isLoading,
  isEmpty,
}
