import { s } from '~/@/schema'
import { UnixMs } from '~/@/time/posix'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { UserSessionId } from './user-session-id'

const schema = s.obj({
  userSessionId: UserSessionId,
  sessionId: s.maybe(SessionId),
  clientSessionId: ClientSessionId,
  userId: UserId,
  createdAt: UnixMs,
  endedAt: s.maybe(UnixMs),
})

export type UserSession = s.Infer<typeof schema>

const random = (overrides?: Partial<UserSession>): UserSession => {
  return {
    userSessionId: UserSessionId.generate(),
    sessionId: SessionId.generate(),
    clientSessionId: ClientSessionId.generate(),
    userId: UserId.generate(),
    createdAt: UnixMs.now(),
    endedAt: null,
    ...overrides,
  }
}

export const UserSession = {
  ...schema,
  random,
}
