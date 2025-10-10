import { ILogger } from '~/@/logger'
import { Paginated } from '~/@/pagination/paginated'
import { Ok } from '~/@/result'
import { PubSub, Sub } from '~/@/sub'
import { IDb } from '../../interface'
import { QueryInput } from '../../interface/query-input/query-input'
import { QueryOutput } from '../../interface/query-output/query-output'
import { logSlowQuery } from '../shared/slow-query-logging'
import { Indexes } from './indexes'
import { filterArray } from './filter-array'
import { queryMap } from './query-input-map'

export type ImplHashMap<TEntity extends Record<string, unknown>, TRelated extends Record<string, unknown>> = {
  t: 'hash-map'
  parser: IDb.Parser<TEntity, TRelated>
  toPrimaryKey: (entity: TEntity) => keyof TEntity
  map?: (entity: TEntity) => TEntity
  getRelated: (entities: TEntity[]) => Promise<TRelated>
  logger: ILogger
}

const globalPubSub = Sub.init<{ t: 'publish' }>()

const init = <TEntity extends Record<string, unknown>, TRelated extends Record<string, unknown>>(
  config: ImplHashMap<TEntity, TRelated>,
): IDb.IDb<TEntity, TRelated> => {
  const pubSubsByQueryKey = new Map<string, PubSub<QueryOutput<TEntity, TRelated>>>()
  const liveQueriesByQueryKey = new Map<string, QueryInput<TEntity>>()
  const entities = new Map<TEntity[keyof TEntity], TEntity>()
  const indexes: Indexes<TEntity> = new Map()

  const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0))

  globalPubSub.sub(async (msg) => {
    switch (msg.t) {
      case 'publish': {
        for (const [queryKey, queryInput] of liveQueriesByQueryKey.entries()) {
          const queried = await query(queryInput)
          const existing = pubSubsByQueryKey.get(queryKey)
          if (!existing) continue
          existing.pub(queried)
          await nextTick()
        }
        return
      }
    }
  })

  const query = async (queryInput: QueryInput<TEntity>): Promise<QueryOutput<TEntity, TRelated>> => {
    const startTime = performance.now()

    const queried = queryMap(entities, indexes, queryInput)

    const related = await config.getRelated(queried)

    const paginatedEntities: Paginated<TEntity> = {
      items: queried,
      total: queried.length,
      offset: queryInput.offset ?? 0,
      limit: queryInput.limit ?? queried.length,
    }

    const output: QueryOutput<TEntity, TRelated> = Ok({
      related,
      entities: paginatedEntities,
    })

    const endTime = performance.now()

    logSlowQuery({
      entityCount: entities.size,
      filteredCount: queried.length,
      logger: config.logger,
      query: queryInput,
      startTime,
      endTime,
    })
    return output
  }

  const enqueuePublish = async () => {
    await nextTick()
    globalPubSub.pub({ t: 'publish' })
  }
  return {
    extra: {
      entities,
      indexes,
    },
    query,
    liveQuery(queryInput, map) {
      const queryKey = QueryInput.toKey(queryInput)
      liveQueriesByQueryKey.set(queryKey, queryInput)
      const existing = pubSubsByQueryKey.get(queryKey)
      if (existing) return Sub.map(existing, map)
      const pubSub = Sub.init<QueryOutput<TEntity, TRelated>>()
      pubSubsByQueryKey.set(queryKey, pubSub)
      enqueuePublish()
      const sub: Sub<QueryOutput<TEntity, TRelated>> = {
        ...pubSub,
        sub(callback) {
          const unsub = pubSub.sub(callback)
          return () => {
            unsub()
            if (pubSub.subscriberCount() === 0) {
              pubSubsByQueryKey.delete(queryKey)
              liveQueriesByQueryKey.delete(queryKey)
            }
          }
        },
      }
      return Sub.map(sub, map)
    },
    async upsert(input) {
      for (const unmappedEntity of input.entities) {
        const e = config.map ? config.map(unmappedEntity) : unmappedEntity
        const primaryKey = config.toPrimaryKey(e)
        const primaryKeyValue = e[primaryKey]
        entities.set(primaryKeyValue, e)
        Indexes.populate(indexes, e, primaryKey)
      }
      enqueuePublish()
      return Ok({
        entities: input.entities,
      })
    },
    async update(input) {
      const filtered = input.where
        ? filterArray(Array.from(entities.values()), input.where)
        : Array.from(entities.values())
      const toUpdate = filtered.slice(input.offset, input.offset + input.limit)
      for (const entity of toUpdate) {
        const updated = { ...entity, ...input.set }
        const primaryKey = config.toPrimaryKey(updated)
        const primaryKeyValue = updated[primaryKey]
        entities.set(primaryKeyValue, updated)
        Indexes.populate(indexes, updated, primaryKey)
      }
      enqueuePublish()
      return Ok(null)
    },
    async delete(input) {
      const filtered = input.where
        ? filterArray(Array.from(entities.values()), input.where)
        : Array.from(entities.values())
      const toDelete = filtered.slice(input.offset, input.offset + input.limit)
      for (const entity of toDelete) {
        const primaryKey = config.toPrimaryKey(entity)
        const primaryKeyValue = entity[primaryKey]
        entities.delete(primaryKeyValue)
      }
      enqueuePublish()
      return Ok({ entities: toDelete })
    },
  }
}

export const ImplHashMap = {
  init,
}
