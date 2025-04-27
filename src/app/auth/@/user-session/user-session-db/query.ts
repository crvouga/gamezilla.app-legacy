import { Pagination } from '~/@/query/query'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'

export type UserSessionDbQuery = {
  whereAnd: {
    userId?: {
      equals: UserId
    }
    sessionId?: {
      equals: SessionId
    }
  }
  order: {
    createdAt?: 'asc' | 'desc'
  }
  pagination: Pagination
}
