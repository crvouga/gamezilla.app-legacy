import { Ok, Sleep } from 'gamezilla-app/@/core'
import type { SessionId, UserId } from 'gamezilla-app/app/@/data'
import type { IUserSessionDb } from './interface'

const sessionIdsByUserId = new Map<UserId, SessionId[]>()
const userIdBySessionId = new Map<SessionId, UserId>()

export type Config = {
  t: 'in-memory'
  simulateLatency: Sleep
}

export const UserSessionDb = (config: Config): IUserSessionDb => {
  return {
    async findSessionIdsByUserId(userId: UserId) {
      await config.simulateLatency()
      const sessionIds = sessionIdsByUserId.get(userId)
      return Ok(sessionIds ?? [])
    },
    async findUserIdBySessionId(sessionId: SessionId) {
      await config.simulateLatency()
      const userId = userIdBySessionId.get(sessionId)
      return Ok(userId ?? null)
    },
    async insert({ sessionId, userId }) {
      await config.simulateLatency()
      const sessionIds = sessionIdsByUserId.get(userId) ?? []
      sessionIds.push(sessionId)
      sessionIdsByUserId.set(userId, sessionIds)
      userIdBySessionId.set(sessionId, userId)
      return Ok(null)
    },
    async zapByUserId(userId) {
      await config.simulateLatency()
      const sessionIds = sessionIdsByUserId.get(userId) ?? []
      for (const sessionId of sessionIds) {
        userIdBySessionId.delete(sessionId)
      }
      sessionIdsByUserId.delete(userId)
      return Ok(null)
    },
    async zapBySessionId(sessionId) {
      await config.simulateLatency()
      const userId = userIdBySessionId.get(sessionId)
      if (userId) {
        const sessionIds = sessionIdsByUserId.get(userId) ?? []
        const idx = sessionIds.indexOf(sessionId)
        if (idx >= 0) {
          sessionIds.splice(idx, 1)
        }
        userIdBySessionId.delete(sessionId)
      }
      return Ok(null)
    }
  }
}
