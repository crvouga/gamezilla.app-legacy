import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { s } from '~/@/schema'
import { OrderBy } from './order-by'
import { Where } from './where'

export type QueryInput<TEntity extends Record<string, unknown>> = {
  where?: Where<TEntity> | undefined | null
  orderBy?: OrderBy<TEntity> | undefined | null
  limit?: number | undefined | null
  offset?: number | undefined | null
  _key?: string | null | undefined
}

const schema = <TEntity extends Record<string, unknown>>(column: s.Schema<TEntity>): s.Schema<QueryInput<TEntity>> => {
  return s.obj({
    where: s.maybe(Where.schema(column)),
    orderBy: s.maybe(OrderBy.schema(column)),
    limit: s.maybe(s.num()),
    offset: s.maybe(s.num()),
    _key: s.maybe(s.str()),
  })
}

const toKey = <TEntity extends Record<string, unknown>>(queryInput: QueryInput<TEntity>): string => {
  if (queryInput._key) return queryInput._key
  return atob(deterministicJsonStringify(queryInput))
}

const ensureKey = <TEntity extends Record<string, unknown>>(queryInput: QueryInput<TEntity>): QueryInput<TEntity> => {
  if (queryInput._key) return queryInput
  return { ...queryInput, _key: toKey(queryInput) }
}

const init = <TEntity extends Record<string, unknown>>(queryInput: QueryInput<TEntity>): QueryInput<TEntity> => {
  return ensureKey(queryInput)
}

export const QueryInput = {
  schema,
  toKey,
  ensureKey,
  init,
}
