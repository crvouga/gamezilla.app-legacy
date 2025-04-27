import { Pagination } from '~/@/query/query'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'

export type UserSessionDbQuery = {
  where: {
    userId?: {
      equals: UserId
    }
    sessionId?: {
      equals: SessionId
    }
  }
  pagination: Pagination
}
