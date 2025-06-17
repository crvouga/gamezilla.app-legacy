import { Pagination } from '~/@/query/query'
import { UserId } from '~/app/@/data/user-id'

export type ProfileDbQuery = {
  whereAnd?: {
    userId?: {
      equals?: UserId
    }
  }
  pagination: Pagination
  order: {
    createdAt: 'asc' | 'desc'
  }
}

const toKey = (query: ProfileDbQuery) => {
  return [query.whereAnd?.userId?.equals, query.pagination.limit, query.pagination.offset, query.order.createdAt]
    .filter(Boolean)
    .join('|')
}

export const ProfileDbQuery = {
  toKey,
}
