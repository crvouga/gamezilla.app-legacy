import { Task } from '~/@/promise/task'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { GuestSessionMapping } from '../guest-session-mapping'

export type IGuestSessionMappingDb = {
  findUserIdBySessionId: (sessionId: SessionId) => Task<string, UserId | null>
  findUserIdByClientSessionId: (clientSessionId: ClientSessionId) => Task<string, UserId | null>
  insert: (input: GuestSessionMapping) => Task<string, null>
}
