import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { Sub } from '~/@/sub'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import { QueryCache } from '~/app/frontend/query-cache/query-cache'
import { Puzzle } from './puzzle'
import { IPuzzleDb } from './puzzle-db/interface'
import { PuzzleQuery } from './puzzle-db/interface-query'

const sub = <TMsg>(puzzleDb: IPuzzleDb, query: PuzzleQuery, mapper: (m: unknown) => TMsg): Sub<TMsg> => {
  return Sub.map(puzzleDb.sub(query), (_c) =>
    mapper(
      GotQueryCacheMsg.init({
        entities: {},
        query,
        results: [],
        t: 'got-entities',
      }),
    ),
  )
}

const read = (queryCache: QueryCache, query: PuzzleQuery): Puzzle[] => {
  const queryKey = deterministicJsonStringify(query)
  const results = queryCache.results[queryKey]
  const entities = results?.map((id) => queryCache.entities[id] as Puzzle) ?? []
  return entities
}

const isLoading = (queryCache: QueryCache, query: PuzzleQuery): boolean => {
  const queryKey = deterministicJsonStringify(query)
  return queryCache.results[queryKey] === undefined
}

export const PuzzleDbQueryCache = {
  sub,
  read,
  isLoading,
}
