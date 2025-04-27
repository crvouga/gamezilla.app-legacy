import { describe, expect, it } from 'bun:test'
import { Logger } from '~/@/logger'
import { PubSubTopicBased } from '~/@/pub-sub-topic-based'
import { unwrap } from '~/@/result'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../user-session'
import { Config, UserSessionDb } from './impl'

const Fixture = async (config: Config) => {
  const userSessionDb = await UserSessionDb(config)
  const userId = UserId.generate()
  const sessions: [UserSession, ...UserSession[]] = [
    UserSession.random({ userId }),
    UserSession.random({ userId }),
    UserSession.random({ userId }),
    UserSession.random(),
    UserSession.random(),
    UserSession.random(),
  ]
  for (const session of sessions) {
    await userSessionDb.insert(session)
  }
  return {
    userSessionDb,
    userId,
    sessions,
  }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()
  const configs: Config[] = []

  configs.push({ t: 'in-memory', simulateLatency: async () => {} })

  configs.push({
    t: 'with-sql-tables',
    dbConnSql: f.dbConnSqlite,
    userSessionDb: await UserSessionDb({ t: 'sql', dbConnSql: f.dbConnSqlite, logger: Logger({ t: 'noop' }) }),
  })

  if (f.t === 'integration') {
    configs.push({ t: 'sql', dbConnSql: f.dbConnPostgres, logger: Logger({ t: 'noop' }) })

    configs.push({
      t: 'sql-with-cache',
      keyValueDb: f.keyValueDbHashMap,
      dbConnSql: f.dbConnPostgres,
      pubSubTopicBased: await PubSubTopicBased({ t: 'in-memory', subscribersByTopic: new Map() }),
      logger: Logger({ t: 'noop' }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe.only(import.meta.file, () => {
  it('should insert correctly', async () => {
    for (const f of await Fixtures()) {
      const userSession = UserSession.random()
      const before = await f.userSessionDb.findUserIdBySessionId(userSession.sessionId)
      const inserted = await f.userSessionDb.insert(userSession)
      const after = await f.userSessionDb.findUserIdBySessionId(userSession.sessionId)
      expect(unwrap(before)).toBe(null)
      expect(unwrap(inserted)).toBe(null)
      expect(unwrap(after)).toBe(userSession.userId)
    }
  })

  it('should find session ids by user id', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const sessionIds = await f.userSessionDb.findSessionIdsByUserId(userId)
      expect(sessionIds.t).toBe('ok')
      const expected = f.sessions.filter((s) => s.userId === userId).map((s) => s.sessionId)
      expect(unwrap(sessionIds)).toEqual(expected)
    }
  })

  it('should be able to zap by user id', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const before = await f.userSessionDb.findSessionIdsByUserId(userId)
      await f.userSessionDb.zapByUserId(userId)
      const after = await f.userSessionDb.findSessionIdsByUserId(userId)

      expect(unwrap(before)).toEqual(f.sessions.filter((s) => s.userId === userId).map((s) => s.sessionId))
      expect(after.t).toBe('ok')
      expect(unwrap(after)).toEqual([])
    }
  })

  it('should be able to zap by session id', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      await f.userSessionDb.zapBySessionId(f.sessions[0].sessionId)
      const sessionIds = await f.userSessionDb.findSessionIdsByUserId(userId)
      expect(sessionIds.t).toBe('ok')
      const expected = f.sessions
        .filter((s) => s.userId === userId && s.sessionId !== f.sessions[0].sessionId)
        .map((s) => s.sessionId)
      expect(unwrap(sessionIds)).toEqual(expected)
    }
  })
})
