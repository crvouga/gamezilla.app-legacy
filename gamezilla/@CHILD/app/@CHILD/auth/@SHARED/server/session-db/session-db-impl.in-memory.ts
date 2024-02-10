import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { ok } from "gamezilla/@SHARED/core"
import { ISessionDb } from "./session-db"

const sessionIdsByUserId = new Map<UserId, SessionId[]>()
const userIdBySessionId = new Map<SessionId, UserId>()

const delay = () => new Promise((resolve) => setTimeout(resolve, 200))

export const SessionDbInMemory = (): ISessionDb => {
  return {
    async findSessionIdsByUserId(userId: UserId) {
      await delay()
      const sessionIds = sessionIdsByUserId.get(userId)
      return ok(sessionIds ?? [])
    },
    async findUserIdBySessionId(sessionId: SessionId) {
      await delay()
      const userId = userIdBySessionId.get(sessionId)
      return ok(userId ?? null)
    },
    async insert({ sessionId, userId }) {
      await delay()
      const sessionIds = sessionIdsByUserId.get(userId) ?? []
      sessionIds.push(sessionId)
      sessionIdsByUserId.set(userId, sessionIds)
      userIdBySessionId.set(sessionId, userId)
      return ok(null)
    },
    async zapByUserId(userId) {
      await delay()
      const sessionIds = sessionIdsByUserId.get(userId) ?? []
      for (const sessionId of sessionIds) {
        userIdBySessionId.delete(sessionId)
      }
      sessionIdsByUserId.delete(userId)
      return ok(null)
    },
    async zapBySessionId(sessionId) {
      await delay()
      const userId = userIdBySessionId.get(sessionId)
      if (userId) {
        const sessionIds = sessionIdsByUserId.get(userId) ?? []
        const idx = sessionIds.indexOf(sessionId)
        if (idx >= 0) {
          sessionIds.splice(idx, 1)
        }
        userIdBySessionId.delete(sessionId)
      }
      return ok(null)
    },
  }
}
