import { Result } from "gamezilla-app/@shared/core"
import { SessionId, UserId } from "gamezilla-app/app/@shared/data"

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
