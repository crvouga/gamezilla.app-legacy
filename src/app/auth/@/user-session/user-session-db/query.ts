import { Pagination } from '~/@/query/query'
import { ClientSessionId } from '~/@/wire/client-session-id'
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
    clientSessionId?: {
      equals: ClientSessionId
    }
  }
  order: {
    createdAt?: 'asc' | 'desc'
  }
  pagination: Pagination
}
