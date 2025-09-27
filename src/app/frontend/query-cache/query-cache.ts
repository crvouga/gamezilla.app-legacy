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
    byType: {
      [entityType: string]: {
        byId: {
          [entityId: string]: Record<string, unknown>
        }
      }
    }
  }
}

const init: QueryCache = {
  queries: {},
  results: {},
  entities: {
    byType: {},
  },
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
  if (!GotQueryCacheMsg.is(input.msgIn)) {
    return { model: input.model }
  }

  switch (input.msgIn.c.t) {
    case 'got-entities': {
      const entityType = input.msgIn.c.entityType
      const existingEntities = input.model.entities.byType[entityType]?.byId ?? {}
      const entitiesNew = { byId: { ...existingEntities } }

      for (const entityId in input.msgIn.c.entities) {
        entitiesNew.byId[entityId] = mergeEntities(
          input.msgIn.c.lastUpdatedAtKey,
          entitiesNew.byId[entityId] ?? {},
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
          ...input.model,
          entities: {
            byType: {
              ...input.model.entities.byType,
              [entityType]: entitiesNew,
            },
          },
          queries: queriesNew,
          results: resultsNew,
        },
      }
    }

    case 'got-entity': {
      const entityType = input.msgIn.c.entityType
      const existingEntities = input.model.entities.byType[entityType]?.byId ?? {}

      return {
        model: {
          ...input.model,
          entities: {
            byType: {
              ...input.model.entities.byType,
              [entityType]: {
                byId: {
                  ...existingEntities,
                  [input.msgIn.c.id]: mergeEntities(
                    input.msgIn.c.lastUpdatedAtKey,
                    existingEntities[input.msgIn.c.id] ?? {},
                    input.msgIn.c.entity,
                  ),
                },
              },
            },
          },
        },
      }
    }
  }
}

export const QueryCache = {
  init,
  update,
}
