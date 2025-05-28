import { p } from '~/@/schema'
import { Posix } from '~/@/time/posix'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { UserSessionId } from './user-session-id'

const parser = p.obj({
  userSessionId: UserSessionId,
  sessionId: p.maybe(SessionId),
  clientSessionId: ClientSessionId,
  userId: UserId,
  createdAt: Posix,
  endedAt: p.maybe(Posix),
})

export type UserSession = p.Infer<typeof parser>

const random = (overrides?: Partial<UserSession>): UserSession => {
  return {
    userSessionId: UserSessionId.generate(),
    sessionId: SessionId.generate(),
    clientSessionId: ClientSessionId.generate(),
    userId: UserId.generate(),
    createdAt: Posix.now(),
    endedAt: null,
    ...overrides,
  }
}

export const UserSession = {
  ...parser,
  random,
}
