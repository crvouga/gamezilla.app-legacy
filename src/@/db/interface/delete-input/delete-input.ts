import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { s } from '~/@/schema'
import { Where } from '../query-input/where'

export type DeleteInput<TEntity extends Record<string, unknown>> = {
  where?: Where<TEntity> | undefined | null
  limit: number
  offset: number
  _key?: string | null | undefined
}

const schema = <TEntity extends Record<string, unknown>>(column: s.Schema<TEntity>): s.Schema<DeleteInput<TEntity>> => {
  return s.obj({
    where: s.maybe(Where.schema(column)),
    limit: s.num(),
    offset: s.num(),
    _key: s.maybe(s.str()),
  })
}

const toKey = <TEntity extends Record<string, unknown>>(queryInput: DeleteInput<TEntity>): string => {
  if (queryInput._key) return queryInput._key
  return atob(deterministicJsonStringify(queryInput))
}

const ensureKey = <TEntity extends Record<string, unknown>>(queryInput: DeleteInput<TEntity>): DeleteInput<TEntity> => {
  if (queryInput._key) return queryInput
  return { ...queryInput, _key: toKey(queryInput) }
}

const init = <TEntity extends Record<string, unknown>>(queryInput: DeleteInput<TEntity>): DeleteInput<TEntity> => {
  return ensureKey(queryInput)
}

export const DeleteInput = {
  schema,
  toKey,
  ensureKey,
  init,
}
