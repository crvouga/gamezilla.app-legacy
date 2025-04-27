import type { Result } from '~/@/result'
import type { SessionId } from '~/@/wire/session-id'
import type { UserId } from '~/app/@/data/user-id'

export type IUserSessionDb = {
  findSessionIdsByUserId: (userId: UserId) => Promise<Result<string, SessionId[]>>

  findUserIdBySessionId: (sessionId: SessionId) => Promise<Result<string, UserId | null>>

  insert: (input: { sessionId: SessionId; userId: UserId }) => Promise<Result<string, null>>

  zapByUserId: (userId: UserId) => Promise<Result<string, null>>

  zapBySessionId: (sessionId: SessionId) => Promise<Result<string, null>>
}
