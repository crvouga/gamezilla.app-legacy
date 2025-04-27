import { Ok } from '~/@/result'
import { IGuestSessionMappingDb } from './interface'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'

export type Config = {
  t: 'hash-map'
}

export const GuestSessionMappingDb = (_config: Config): IGuestSessionMappingDb => {
  const userIdBySessionId = new Map<SessionId, UserId>()
  const sessionIdByUserId = new Map<UserId, SessionId>()
  return {
    async findUserIdBySessionId(sessionId) {
      const userId = userIdBySessionId.get(sessionId)
      return Ok(userId ?? null)
    },
    async insert(input) {
      userIdBySessionId.set(input.sessionId, input.guestUserId)
      sessionIdByUserId.set(input.guestUserId, input.sessionId)
      return Ok(null)
    },
  }
}
