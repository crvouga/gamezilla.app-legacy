import { Pagination } from '~/@/pagination/pagination'
import { QueryInput } from '../../interface/query-input/query-input'
import { filterMap } from './filter-map'
import { sortArray } from './sort-array'
import { Indexes } from './indexes'

export const queryMap = <TEntity extends Record<string, unknown>>(
  entities: Map<TEntity[keyof TEntity], TEntity>,
  indexes: Indexes<TEntity>,
  queryInput: QueryInput<TEntity>,
) => {
  const all = entities

  const filtered: Map<TEntity[keyof TEntity], TEntity> = queryInput.where
    ? filterMap(all, indexes, queryInput.where)
    : all

  const sorted: TEntity[] = queryInput.orderBy
    ? sortArray(Array.from(filtered.values()), queryInput.orderBy)
    : Array.from(filtered.values())

  const paginated = Pagination.paginate(sorted, {
    offset: queryInput.offset ?? 0,
    limit: queryInput.limit ?? sorted.length,
  })

  return paginated
}
