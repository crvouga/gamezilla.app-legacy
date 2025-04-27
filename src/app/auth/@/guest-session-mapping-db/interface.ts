import { Task } from '~/@/promise/task'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'

export type IGuestSessionMappingDb = {
  findUserIdBySessionId: (sessionId: SessionId) => Task<string, UserId | null>
  insert: (input: { guestUserId: UserId; sessionId: SessionId }) => Task<string, null>
}
