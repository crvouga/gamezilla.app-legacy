import type { Result } from '~/@/result'
import type { SessionId } from '~/@/wire/session-id'
import { Paginated } from '~/app/@/data/pagination'
import type { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../user-session'
import { UserSessionDbQuery } from './query'

export type IUserSessionDb = {
  findSessionIdsByUserId: (userId: UserId) => Promise<Result<string, SessionId[]>>

  findUserIdBySessionId: (sessionId: SessionId) => Promise<Result<string, UserId | null>>

  query: (input: UserSessionDbQuery) => Promise<Result<string, Paginated<UserSession>>>

  insert: (input: UserSession) => Promise<Result<string, null>>

  zapByUserId: (userId: UserId) => Promise<Result<string, null>>

  zapBySessionId: (sessionId: SessionId) => Promise<Result<string, null>>
}
