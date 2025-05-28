import { s } from '../schema'

export type Query<T, TWhereOperator = WhereOperator> = {
  limit: number
  offset: number
  order: Order<T>
  where: Where<T, TWhereOperator>
}

export type Order<T> = OrderSingle<T> | OrderSingle<T>[]

export type OrderSingle<T> = [OrderDirection, keyof T]

export type OrderDirection = 'asc' | 'desc'

export type Where<T, TWhereOperator = WhereOperator> = ['and' | 'or', ...WhereClause<T, TWhereOperator>[]]

export type WhereClause<T, TWhereOperator = WhereOperator> = [TWhereOperator, keyof T, WhereValue<T>]

export type WhereOperator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'like'
  | 'in'
  | 'not in'
  | 'is null'
  | 'is not null'
  | 'between'
  | 'not between'
  | 'exists'
  | 'not exists'
  | 'any'
  | 'all'
  | 'some'
  | 'overlaps'
  | 'contains'

export type WhereValue<T> = T[keyof T] | T[keyof T][]

export const Pagination = s.obj({
  limit: s.num,
  offset: s.num,
})

export type Pagination = s.Infer<typeof Pagination>

export type PaginationResult = Pagination & {
  total: number
}

export type QueryResult<T> = PaginationResult & {
  rows: T[]
}

type Row = {
  id: string
  name: string
  lastName: string
  age: number
}

export const example: Query<Row> = {
  limit: 10,
  offset: 0,
  order: [['asc', 'age']],
  where: ['and', ['>', 'age', 18], ['like', 'name', 'John'], ['like', 'lastName', 'Doe']],
}
