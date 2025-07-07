import type { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { ClientSessionId } from '~/@/wire/client-session-id'
import type { SessionId } from '~/@/wire/session-id'
import { Paginated } from '~/app/@/data/pagination'
import type { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../user-session'
import { UserSessionId } from '../user-session-id'
import { UserSessionDbQuery } from './interface-query'

export type IUserSessionDb = {
  findSessionIdsByUserId: (userId: UserId) => Promise<Result<string, SessionId[]>>

  findUserIdBySessionId: (sessionId: SessionId) => Promise<Result<string, UserId | null>>

  query: (input: UserSessionDbQuery) => Promise<Result<string, Paginated<UserSession>>>

  sub: <TMsg>(input: UserSessionDbQuery, mapper: (userSessions: UserSession[]) => TMsg) => Sub<TMsg>

  upsert: (input: UserSession) => Promise<Result<string, null>>

  update: (input: { userSessionId: UserSessionId; updates: Partial<UserSession> }) => Promise<Result<string, null>>

  zapByUserId: (userId: UserId) => Promise<Result<string, null>>

  zapBySessionId: (sessionId: SessionId) => Promise<Result<string, null>>

  zapByClientSessionId: (clientSessionId: ClientSessionId) => Promise<Result<string, null>>
}
