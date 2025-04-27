import { Posix } from '~/@/time/posix'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { UserSessionId } from './user-session-id'

export type UserSession = {
  userSessionId: UserSessionId
  sessionId: SessionId
  userId: UserId
  createdAt: Posix
  endedAt: Posix | null
}

const random = (overrides?: Partial<UserSession>): UserSession => {
  return {
    userSessionId: UserSessionId.generate(),
    sessionId: SessionId.generate(),
    userId: UserId.generate(),
    createdAt: Posix.now(),
    endedAt: null,
    ...overrides,
  }
}

export const UserSession = {
  random,
}
