import { Task } from '@/core'
import { SessionId, UserId } from 'app/@/data'

export type IGuestSessionMappingDb = {
  findUserIdBySessionId: (sessionId: SessionId) => Task<string, UserId | null>
  insert: (input: { guestUserId: UserId; sessionId: SessionId }) => Task<string, null>
}
