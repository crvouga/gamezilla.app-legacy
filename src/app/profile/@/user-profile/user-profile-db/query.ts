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
