import { s } from '~/@/schema'

export type WhereEquals<T extends Record<string, unknown>> = {
  [K in keyof T]: {
    op: '='
    column: K
    value: T[K]
  }
}[keyof T]

export type WhereIn<T extends Record<string, unknown>> = {
  [K in keyof T]: {
    op: 'in'
    column: K
    value: T[K][]
  }
}[keyof T]

export type WhereAnd<T extends Record<string, unknown>> = {
  op: 'and'
  clauses: Where<T>[]
}

export type Where<T extends Record<string, unknown>> = WhereEquals<T> | WhereIn<T> | WhereAnd<T>

const schema = <TEntity extends Record<string, unknown>>(column: s.Schema<TEntity>): s.Schema<Where<TEntity>> => {
  return s.or(
    s.obj({
      op: s.l('='),
      column: s.keyOf(column),
      value: s.any,
    }),
    s.obj({
      op: s.l('in'),
      column: s.keyOf(column),
      value: s.arr(s.any),
    }),
    s.obj({
      op: s.l('and'),
      clauses: s.arr(s.any),
    }),
  )
}

export const Where = {
  schema,
}
