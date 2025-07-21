import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { GotQueryCacheMsg } from './got-query-cache-msg.$msg'

export type QueryCache = {
  queries: {
    [queryKey: string]: Record<string, unknown>
  }
  results: {
    [queryKey: string]: string[]
  }
  entities: {
    [entityId: string]: Record<string, unknown>
  }
}

const init: QueryCache = {
  queries: {},
  results: {},
  entities: {},
}

const update = (input: {
  model: QueryCache
  msgIn: unknown
}): {
  model: QueryCache
} => {
  if (GotQueryCacheMsg.is(input.msgIn)) {
    const entitiesNew = { ...input.model.entities }
    for (const entityId in input.msgIn.c.entities) {
      entitiesNew[entityId] = { ...(entitiesNew[entityId] ?? {}), ...input.msgIn.c.entities[entityId] }
    }
    const queryKey = deterministicJsonStringify(input.msgIn.c.query)
    const queriesNew = {
      ...input.model.queries,
      [queryKey]: input.msgIn.c.query,
    }
    const resultsNew = {
      ...input.model.results,
      [queryKey]: input.msgIn.c.results,
    }
    return {
      model: {
        entities: entitiesNew,
        queries: queriesNew,
        results: resultsNew,
      },
    }
  }
  return { model: input.model }
}

export const QueryCache = {
  init,
  update,
}
