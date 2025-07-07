import { DbErr } from '~/@/db/interface/error'
import { isOk, Ok, Result } from '~/@/result'
import { s } from '~/@/schema'
import { Paginated } from '../../../pagination/paginated'

const schema = <T, U>(entity: s.Schema<T>, related: s.Schema<U>) => {
  return Result.schema(
    DbErr.schema,
    s.obj({
      entities: Paginated.schema(entity),
      related: related,
    }),
  )
}

export type QueryOutput<T, U> = s.Infer<ReturnType<typeof schema<T, U>>>

const init = <T, U>(): QueryOutput<T, U> => {
  return Ok({
    entities: Paginated.empty<T>(),
    related: {} as U,
  })
}

const first = <T, U>(query: QueryOutput<T, U> | null | undefined): T | null => {
  if (!query) return null
  if (isOk(query)) return query.value.entities.items[0] ?? null
  return null
}

const related = <T, U>(query: QueryOutput<T, U> | null | undefined): U | null => {
  if (!query) return null
  if (isOk(query)) return query.value.related ?? null
  return null
}

const entities = <T, U>(query: QueryOutput<T, U> | null | undefined): Paginated<T> | null => {
  if (!query) return null
  if (isOk(query)) return query.value.entities ?? null
  return null
}

export const QueryOutput = {
  schema,
  first,
  related,
  init,
  entities,
}
