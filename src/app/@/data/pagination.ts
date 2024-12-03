export type Pagination = {
  limit: number
  offset: number
}

export type WithPagination = {
  pagination: Pagination
}

export type Paginated<T> = Pagination & {
  items: T[]
  total: number
}

const init = <T>(): Paginated<T> => {
  return {
    limit: 0,
    offset: 0,
    items: [],
    total: 0
  }
}

export const Paginated = {
  init
}
