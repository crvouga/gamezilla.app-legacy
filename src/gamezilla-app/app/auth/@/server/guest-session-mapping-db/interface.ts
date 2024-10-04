import { Task } from 'gamezilla-app/@/core'
import { SessionId, UserId } from 'gamezilla-app/app/@/data'

export type IGuestSessionMappingDb = {
  findUserIdBySessionId: (sessionId: SessionId) => Task<string, UserId | null>
  insert: (input: { guestUserId: UserId; sessionId: SessionId }) => Task<string, null>
}
