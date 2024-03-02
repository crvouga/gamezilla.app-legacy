import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { Result } from "gamezilla/@SHARED/core"

export type ISessionDb = {
  findSessionIdsByUserId: (
    userId: UserId,
  ) => Promise<Result<string, SessionId[]>>

  findUserIdBySessionId: (
    sessionId: SessionId,
  ) => Promise<Result<string, UserId | null>>

  insert: (input: {
    sessionId: SessionId
    userId: UserId
  }) => Promise<Result<string, null>>

  zapByUserId: (userId: UserId) => Promise<Result<string, null>>

  zapBySessionId: (sessionId: SessionId) => Promise<Result<string, null>>
}
