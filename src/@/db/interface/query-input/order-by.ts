import { s } from '~/@/schema'
import { OrderDirection } from './order-by/direction'

export type OrderBy<TEntity extends Record<string, unknown>> = {
  column: keyof TEntity
  direction: OrderDirection
}[]

const schema = <TEntity extends Record<string, unknown>>(column: s.Schema<TEntity>): s.Schema<OrderBy<TEntity>> => {
  const schema = s.arr(
    s.obj({
      column: s.keyOf(column),
      direction: OrderDirection.schema,
    }),
  )
  return schema
}

export const OrderBy = {
  schema,
}
