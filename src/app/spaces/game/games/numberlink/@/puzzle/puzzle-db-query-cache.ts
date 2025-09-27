import { indexBy } from '~/@/array/index-by'
import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { Sub } from '~/@/sub'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import { QueryCache } from '~/app/frontend/query-cache/query-cache'
import { Puzzle } from './puzzle'
import { IPuzzleDb } from './puzzle-db/interface'
import { PuzzleQuery } from './puzzle-db/interface-query'
import { PuzzleId } from './puzzle-id'

const ENTITY_TYPE = 'game-numberlink-puzzle'

const sub = <TMsg>(puzzleDb: IPuzzleDb, query: PuzzleQuery, mapper: (m: unknown) => TMsg): Sub<TMsg> => {
  return puzzleDb.sub(query, (puzzles) => {
    return mapper(
      GotQueryCacheMsg.init({
        entities: indexBy(puzzles, (c) => c.id),
        query,
        results: puzzles.map((c) => c.id),
        t: 'got-entities',
        entityType: ENTITY_TYPE,
        lastUpdatedAtKey: Puzzle.key('lastUpdatedAt'),
      }),
    )
  })
}

const read = (ctx: { queryCache: QueryCache }, query: PuzzleQuery): Puzzle[] => {
  const queryKey = deterministicJsonStringify(query)
  const results = ctx.queryCache.results[queryKey]
  const entities = results?.map((id) => ctx.queryCache.entities.byType[ENTITY_TYPE]?.byId[id] as Puzzle) ?? []
  return entities
}

const entity = (ctx: { queryCache: QueryCache }, id: PuzzleId | undefined | null): Puzzle | null => {
  if (!id) return null
  const entity = ctx.queryCache.entities.byType[ENTITY_TYPE]?.byId[id]
  if (!entity) return null
  return entity as Puzzle
}

const gotEntity = (puzzleId: PuzzleId, puzzleNew: Puzzle): GotQueryCacheMsg => {
  return GotQueryCacheMsg.init({
    t: 'got-entity',
    entityType: ENTITY_TYPE,
    id: puzzleId,
    entity: puzzleNew,
    lastUpdatedAtKey: Puzzle.key('lastUpdatedAt'),
  })
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
  gotEntity,
  read,
  isLoading,
  isEmpty,
}
