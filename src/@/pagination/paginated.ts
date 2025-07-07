import { s } from '~/@/schema'
import { Pagination } from './pagination'

const schema = <T>(t: s.Schema<T>) => {
  return s.obj({
    items: s.arr(t),
    total: s.num(),
    offset: s.num(),
    limit: s.num(),
  })
}

export type Paginated<T> = s.Infer<ReturnType<typeof schema<T>>>

const empty = <T>(pagination?: Partial<Pagination>): Paginated<T> => {
  return {
    items: [],
    total: 0,
    offset: pagination?.offset ?? 0,
    limit: pagination?.limit ?? 0,
  }
}

export const Paginated = {
  schema,
  empty,
}
