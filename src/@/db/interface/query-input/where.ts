import { s } from '~/@/schema'

export type Where<T extends Record<string, unknown>> =
  | {
      op: '='
      column: keyof T
      value: string
    }
  | {
      op: 'in'
      column: keyof T
      value: string[]
    }
  | {
      op: 'and'
      clauses: Where<T>[]
    }

const schema = <TEntity extends Record<string, unknown>>(column: s.Schema<TEntity>): s.Schema<Where<TEntity>> => {
  return s.or(
    s.obj({
      op: s.l('='),
      column: s.keyOf(column),
      value: s.str(),
    }),
    s.obj({
      op: s.l('in'),
      column: s.keyOf(column),
      value: s.arr(s.str()),
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
