import { describe, expect, it, test } from 'bun:test'
import { Logger } from '~/@/logger'
import { PubSubTopicBased } from '~/@/pub-sub-topic-based'
import { unwrap } from '~/@/result'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../user-session'
import { Config, UserSessionDb } from './impl'
import { SessionId } from '~/@/wire/session-id'
import { UnixMs } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { ClientSessionId } from '~/@/wire/client-session-id'

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
    sqlDb: f.sqlDbSqlite,
    userSessionDb: await UserSessionDb({ t: 'sql', sqlDb: f.sqlDbSqlite, logger: Logger({ t: 'noop' }) }),
  })

  if (f.t === 'integration') {
    configs.push({ t: 'sql', sqlDb: f.sqlDbPostgres, logger: Logger({ t: 'noop' }) })

    configs.push({
      t: 'sql-with-cache',
      keyValueDb: f.keyValueDbHashMap,
      sqlDb: f.sqlDbPostgres,
      pubSubTopicBased: await PubSubTopicBased({ t: 'in-memory', subscribersByTopic: new Map() }),
      logger: Logger({ t: 'noop' }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe(import.meta.file, () => {
  it('should insert correctly', async () => {
    for (const f of await Fixtures()) {
      const userSession = UserSession.random()
      if (!userSession.sessionId) throw new Error('test setup failed')

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
      const expected = f.sessions.filter((s) => s.userId === userId).flatMap((s) => (s.sessionId ? [s.sessionId] : []))
      expect(unwrap(sessionIds)).toEqual(expected)
    }
  })

  it('should be able to zap by user id', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const before = await f.userSessionDb.findSessionIdsByUserId(userId)
      await f.userSessionDb.zapByUserId(userId)
      const after = await f.userSessionDb.findSessionIdsByUserId(userId)

      expect(unwrap(before)).toEqual(
        f.sessions.filter((s) => s.userId === userId).flatMap((s) => (s.sessionId ? [s.sessionId] : [])),
      )
      expect(after.t).toBe('ok')
      expect(unwrap(after)).toEqual([])
    }
  })

  it('should be able to zap by session id', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const sessionId = f.sessions[0].sessionId
      if (!sessionId) throw new Error('test setup failed')
      await f.userSessionDb.zapBySessionId(sessionId)
      const sessionIds = await f.userSessionDb.findSessionIdsByUserId(userId)
      expect(sessionIds.t).toBe('ok')
      const expected = f.sessions
        .filter((s) => s.userId === userId && s.sessionId !== f.sessions[0].sessionId)
        .flatMap((s) => (s.sessionId ? [s.sessionId] : []))
      expect(unwrap(sessionIds)).toEqual(expected)
    }
  })

  it('should be able to zap by client session id', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const clientSessionId = ClientSessionId.generate()
      const sessionId = f.sessions[0].sessionId
      if (!sessionId) throw new Error('test setup failed')
      await f.userSessionDb.zapByClientSessionId(clientSessionId)
      const sessionIds = await f.userSessionDb.findSessionIdsByUserId(userId)
      expect(sessionIds.t).toBe('ok')
      const expected = f.sessions
        .filter((s) => s.userId === userId && s.sessionId !== f.sessions[0].sessionId)
        .flatMap((s) => (s.sessionId ? [s.sessionId] : []))
      expect(unwrap(sessionIds)).toEqual(expected)
    }
  })

  test('query equals userId', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const before = await f.userSessionDb.query({
        whereAnd: {
          userId: {
            equals: userId,
          },
        },
        pagination: {
          limit: 100,
          offset: 0,
        },
        order: {
          createdAt: 'asc',
        },
      })

      const expected: UserSession[] = []
      for (let i = 0; i < 10; i++) {
        const session = UserSession.random({
          userId,
          createdAt: UnixMs.future(UnixMs.now(), TimeSpan.seconds(i)),
        })
        await f.userSessionDb.insert(session)
        expected.push(session)
        await f.userSessionDb.insert(UserSession.random())
      }

      expected.sort((a, b) => a.createdAt - b.createdAt)

      const after = await f.userSessionDb.query({
        whereAnd: {
          userId: {
            equals: userId,
          },
        },
        pagination: {
          limit: 100,
          offset: 0,
        },
        order: {
          createdAt: 'asc',
        },
      })

      expect(unwrap(before)).toEqual({
        items: [],
        total: 0,
        limit: 100,
        offset: 0,
      })

      expect(unwrap(after)).toEqual({
        items: expected,
        total: expected.length,
        limit: 100,
        offset: 0,
      })
    }
  })

  test('query equals sessionId', async () => {
    for (const f of await Fixtures()) {
      const sessionId = SessionId.generate()
      const before = await f.userSessionDb.query({
        whereAnd: {
          sessionId: {
            equals: sessionId,
          },
        },
        pagination: {
          limit: 100,
          offset: 0,
        },
        order: {
          createdAt: 'asc',
        },
      })

      const expected: UserSession[] = []
      for (let i = 0; i < 10; i++) {
        const session = UserSession.random({
          sessionId,
          createdAt: UnixMs.future(UnixMs.now(), TimeSpan.seconds(i)),
        })
        await f.userSessionDb.insert(session)
        expected.push(session)
        await f.userSessionDb.insert(UserSession.random())
      }

      expected.sort((a, b) => a.createdAt - b.createdAt)

      const after = await f.userSessionDb.query({
        whereAnd: {
          sessionId: {
            equals: sessionId,
          },
        },
        pagination: {
          limit: 100,
          offset: 0,
        },
        order: {
          createdAt: 'asc',
        },
      })

      expect(unwrap(before)).toEqual({
        items: [],
        total: 0,
        limit: 100,
        offset: 0,
      })

      expect(unwrap(after)).toEqual({
        items: expected,
        total: expected.length,
        limit: 100,
        offset: 0,
      })
    }
  })

  test('query equals clientSessionId', async () => {
    for (const f of await Fixtures()) {
      const clientSessionId = ClientSessionId.generate()
      const before = await f.userSessionDb.query({
        whereAnd: {
          clientSessionId: {
            equals: clientSessionId,
          },
        },
        pagination: {
          limit: 100,
          offset: 0,
        },
        order: {
          createdAt: 'asc',
        },
      })

      const expected: UserSession[] = []
      for (let i = 0; i < 10; i++) {
        const session = UserSession.random({
          clientSessionId,
          createdAt: UnixMs.future(UnixMs.now(), TimeSpan.seconds(i)),
        })
        await f.userSessionDb.insert(session)
        expected.push(session)
        await f.userSessionDb.insert(UserSession.random())
      }

      expected.sort((a, b) => a.createdAt - b.createdAt)

      const after = await f.userSessionDb.query({
        whereAnd: {
          clientSessionId: {
            equals: clientSessionId,
          },
        },
        pagination: {
          limit: 100,
          offset: 0,
        },
        order: {
          createdAt: 'asc',
        },
      })

      expect(unwrap(before)).toEqual({
        items: [],
        total: 0,
        limit: 100,
        offset: 0,
      })

      expect(unwrap(after)).toEqual({
        items: expected,
        total: expected.length,
        limit: 100,
        offset: 0,
      })
    }
  })
})
