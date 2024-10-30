import { describe, expect, it } from 'bun:test'
import { unwrap } from 'gamezilla-app/@/core'
import { SessionId, UserId } from 'gamezilla-app/app/@/data'
import { Logger } from 'gamezilla-app/app/@/server/logger'
import { PubSubTopicBased } from 'gamezilla-app/app/@/server/pub-sub-topic-based'
import { AppServerTestEnv } from 'gamezilla-app/app/@/server/server-test-env'
import { Config, UserSessionDb } from './impl'

const Fixture = async (config: Config) => {
  const userSessionDb = await UserSessionDb(config)
  const userId = UserId.generate()
  const sessions = [
    {
      sessionId: SessionId.generate(),
      userId
    },
    {
      sessionId: SessionId.generate(),
      userId
    },
    {
      sessionId: SessionId.generate(),
      userId
    },
    {
      sessionId: SessionId.generate(),
      userId: UserId.generate()
    },
    {
      sessionId: SessionId.generate(),
      userId: UserId.generate()
    },
    {
      sessionId: SessionId.generate(),
      userId: UserId.generate()
    }
  ] as const
  for (const session of sessions) {
    await userSessionDb.insert(session)
  }
  return {
    userSessionDb,
    userId,
    sessions
  }
}

const Fixtures = async () => {
  const testEnv = await AppServerTestEnv()
  const configs: Config[] = [
    {
      t: 'in-memory',
      simulateLatency: async () => {}
    }
  ]

  if (testEnv.t === 'integration') {
    configs.push({
      t: 'postgres',
      dbConnSql: testEnv.dbConnSql,
      logger: Logger({ t: 'noop' })
    })

    configs.push({
      t: 'postgres-with-cache',
      dbConnKv: testEnv.dbConnKv,
      dbConnSql: testEnv.dbConnSql,
      pubSubTopicBased: await PubSubTopicBased({ t: 'in-memory' }),
      logger: Logger({ t: 'noop' })
    })
  }
  return Promise.all(configs.map(Fixture))
}

describe(import.meta.file, () => {
  it('should insert correctly', async () => {
    for (const f of await Fixtures()) {
      const session = {
        sessionId: SessionId.generate(),
        userId: UserId.generate()
      }
      const before = await f.userSessionDb.findUserIdBySessionId(session.sessionId)
      const inserted = await f.userSessionDb.insert(session)
      const after = await f.userSessionDb.findUserIdBySessionId(session.sessionId)
      expect(unwrap(before)).toBe(null)
      expect(inserted.t).toBe('ok')
      expect(unwrap(after)).toBe(session.userId)
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
