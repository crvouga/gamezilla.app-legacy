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

const mergeEntities = (
  lastUpdatedAtKey: string,
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
) => {
  const existingLastUpdatedAt = existing[lastUpdatedAtKey]
  const incomingLastUpdatedAt = incoming[lastUpdatedAtKey]
  if (existingLastUpdatedAt && incomingLastUpdatedAt && existingLastUpdatedAt > incomingLastUpdatedAt) {
    return existing
  }
  return { ...existing, ...incoming }
}

const update = (input: {
  model: QueryCache
  msgIn: unknown
}): {
  model: QueryCache
} => {
  if (GotQueryCacheMsg.is(input.msgIn)) {
    switch (input.msgIn.c.t) {
      case 'got-entities': {
        const entitiesNew = { ...input.model.entities }
        for (const entityId in input.msgIn.c.entities) {
          entitiesNew[entityId] = mergeEntities(
            input.msgIn.c.lastUpdatedAtKey,
            entitiesNew[entityId] ?? {},
            input.msgIn.c.entities[entityId] ?? {},
          )
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

      case 'got-entity': {
        const entitiesNew = {
          ...input.model.entities,
          [input.msgIn.c.id]: mergeEntities(
            input.msgIn.c.lastUpdatedAtKey,
            input.model.entities[input.msgIn.c.id] ?? {},
            input.msgIn.c.entity,
          ),
        }
        return {
          model: {
            ...input.model,
            entities: entitiesNew,
          },
        }
      }
    }
  }
  return { model: input.model }
}

export const QueryCache = {
  init,
  update,
}
