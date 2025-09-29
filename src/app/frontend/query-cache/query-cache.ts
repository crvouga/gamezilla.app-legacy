import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { GotQueryCacheMsg } from './got-query-cache-msg.$msg'

export type QueryCache = {
  queryCache_queries: {
    [queryKey: string]: Record<string, unknown>
  }
  queryCache_results: {
    [queryKey: string]: string[]
  }
  queryCache_entities: {
    byType: {
      [entityType: string]: {
        byId: {
          [entityId: string]: Record<string, unknown>
        }
      }
    }
  }
}

const init = (_input: {}): { model: QueryCache } => {
  return {
    model: {
      queryCache_queries: {},
      queryCache_results: {},
      queryCache_entities: {
        byType: {},
      },
    },
  }
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

const update = <TModel extends QueryCache>(input: {
  model: TModel
  msgIn?: unknown
}): {
  model: TModel
} => {
  const { msgIn } = input

  if (!GotQueryCacheMsg.is(msgIn)) return { model: input.model }

  switch (msgIn.c.t) {
    case 'got-entities': {
      const entityType = msgIn.c.entityType
      const existingEntities = input.model.queryCache_entities.byType[entityType]?.byId ?? {}
      const entitiesNew = { byId: { ...existingEntities } }

      for (const entityId in msgIn.c.entities) {
        entitiesNew.byId[entityId] = mergeEntities(
          msgIn.c.lastUpdatedAtKey,
          entitiesNew.byId[entityId] ?? {},
          msgIn.c.entities[entityId] ?? {},
        )
      }

      const queryKey = deterministicJsonStringify(msgIn.c.query)
      const queriesNew = {
        ...input.model.queryCache_queries,
        [queryKey]: msgIn.c.query,
      }
      const resultsNew = {
        ...input.model.queryCache_results,
        [queryKey]: msgIn.c.results,
      }

      return {
        model: {
          ...input.model,
          queryCache_entities: {
            byType: {
              ...input.model.queryCache_entities.byType,
              [entityType]: entitiesNew,
            },
          },
          queryCache_queries: queriesNew,
          queryCache_results: resultsNew,
        },
      }
    }

    case 'got-entity': {
      const entityType = msgIn.c.entityType
      const existingEntities = input.model.queryCache_entities.byType[entityType]?.byId ?? {}

      return {
        model: {
          ...input.model,
          queryCache_entities: {
            byType: {
              ...input.model.queryCache_entities.byType,
              [entityType]: {
                byId: {
                  ...existingEntities,
                  [msgIn.c.id]: mergeEntities(
                    msgIn.c.lastUpdatedAtKey,
                    existingEntities[msgIn.c.id] ?? {},
                    msgIn.c.entity,
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
