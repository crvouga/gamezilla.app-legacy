import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { Sub } from '~/@/sub'
import { QueryCacheMsg, queryCacheMsgs } from './query-cache-msgs'

export type Msg = QueryCacheMsg

export type Model = {
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

export const init = (_input: {}): { model: Model } => {
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

export const update = (input: {
  model: Model
  msg: Msg
}): {
  model: Model
} => {
  const { msg } = input

  switch (msg.t) {
    case 'gotEntities': {
      const entityType = msg.entityType
      const existingEntities = input.model.queryCache_entities.byType[entityType]?.byId ?? {}
      const entitiesNew = { byId: { ...existingEntities } }

      for (const entityId in msg.entities) {
        entitiesNew.byId[entityId] = mergeEntities(
          msg.lastUpdatedAtKey,
          entitiesNew.byId[entityId] ?? {},
          msg.entities[entityId] ?? {},
        )
      }

      const queryKey = deterministicJsonStringify(msg.query)
      const queriesNew = {
        ...input.model.queryCache_queries,
        [queryKey]: msg.query,
      }
      const resultsNew = {
        ...input.model.queryCache_results,
        [queryKey]: msg.results,
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

    case 'gotEntity': {
      const entityType = msg.entityType
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
                  [msg.id]: mergeEntities(msg.lastUpdatedAtKey, existingEntities[msg.id] ?? {}, msg.entity),
                },
              },
            },
          },
        },
      }
    }
  }
}

export const subscriptions = (_input: { model: Model }): Sub<Msg> => {
  return queryCacheMsgs
}
