import { Logger } from '~/@/logger'
import { isOk, unwrap } from '~/@/result'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { describe, expect, test } from '~/@/test-runner'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { UserId } from '~/app/@/data/user-id'
import { UserSession } from '../user-session'
import { UserSessionDb } from './impl'

const Fixture = async (config: UserSessionDb) => {
  const userSessionDb = await UserSessionDb.init(config)
  const userId = UserId.generate()
  const sessions: [UserSession, ...UserSession[]] = [
    UserSession.random({ userId }),
    UserSession.random({ userId }),
    UserSession.random({ userId }),
    UserSession.random(),
    UserSession.random(),
    UserSession.random(),
  ]
  await userSessionDb.upsert({ entities: sessions })

  return {
    userSessionDb,
    userId,
    sessions,
  }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()
  const configs: UserSessionDb[] = []

  configs.push({
    t: 'sql',
    sqlDb: f.sqlDbSqlite,
    logger: Logger.init({ t: 'noop' }),
    migrationPolicy: SqlDbMigrationPolicy.init({ t: 'always-run', logger: Logger.init({ t: 'noop' }) }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql',
      sqlDb: f.sqlDbPostgres,
      logger: Logger.init({ t: 'noop' }),
      migrationPolicy: SqlDbMigrationPolicy.init({ t: 'always-run', logger: Logger.init({ t: 'noop' }) }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('UserSessionDb', () => {
  test('should insert correctly', async () => {
    for (const f of await Fixtures()) {
      const userSession = UserSession.random()
      if (!userSession.sessionId) throw new Error('test setup failed')

      const before = await f.userSessionDb.query({
        limit: 100,
        offset: 0,
        where: {
          op: 'and',
          clauses: [
            {
              op: '=',
              column: 'sessionId',
              value: userSession.sessionId,
            },
            {
              op: '=',
              column: 'endedAt',
              value: null,
            },
          ],
        },
      })

      const inserted = await f.userSessionDb.upsert({ entities: [userSession] })

      const after = await f.userSessionDb.query({
        limit: 100,
        offset: 0,
        where: {
          op: 'and',
          clauses: [{ op: '=', column: 'sessionId', value: userSession.sessionId }],
        },
      })
      expect(unwrap(before).entities.items).toEqual([])
      if (isOk(inserted)) {
        expect(inserted.value.entities).toEqual([userSession])
      } else {
        throw new Error(`Upsert failed: ${JSON.stringify(inserted)}`)
      }
      expect(unwrap(after).entities.items).toEqual([userSession])
    }
  })

  test('should find session ids by user id', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const sessionIds = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [{ op: '=', column: 'userId', value: userId }],
        },
        limit: 100,
        offset: 0,
      })
      expect(sessionIds.t).toEqual('ok')
      const expected = f.sessions.filter((s) => s.userId === userId).flatMap((s) => (s.sessionId ? [s.sessionId] : []))
      expect(unwrap(sessionIds).entities.items.map((s) => s.sessionId)).toEqual(expected)
    }
  })

  test('should be able to zap by user id', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const before = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [{ op: '=', column: 'userId', value: userId }],
        },
        limit: 100,
        offset: 0,
      })
      const userSessionsNew = unwrap(before).entities.items.map((s) => ({
        ...s,
        endedAt: UnixMs.now(),
      }))
      await f.userSessionDb.upsert({ entities: userSessionsNew })
      const after = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [{ op: '=', column: 'userId', value: userId }],
        },
        limit: 100,
        offset: 0,
      })
      expect(unwrap(before).entities.items).toEqual(f.sessions.filter((s) => s.userId === userId))
      expect(after.t).toEqual('ok')
      expect(unwrap(after).entities.items).toEqual([])
    }
  })

  test('should be able to zap by session id', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const sessionId = f.sessions[0].sessionId
      if (!sessionId) throw new Error('test setup failed')
      const before = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'sessionId', value: sessionId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        limit: 100,
        offset: 0,
      })
      const userSessionsNew = unwrap(before).entities.items.map((s) => ({
        ...s,
        endedAt: UnixMs.now(),
      }))
      await f.userSessionDb.upsert({ entities: userSessionsNew })
      const sessionIds = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'userId', value: userId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        limit: 100,
        offset: 0,
      })
      expect(unwrap(sessionIds).entities.items).toEqual(f.sessions.filter((s) => s.userId === userId))
      const expected = f.sessions
        .filter((s) => s.userId === userId && s.sessionId !== f.sessions[0].sessionId)
        .flatMap((s) => (s.sessionId ? [s.sessionId] : []))
      expect(unwrap(sessionIds).entities.items.map((s) => s.sessionId)).toEqual(expected)
    }
  })

  test('should be able to zap by client session id', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const clientSessionId = ClientSessionId.generate()
      const sessionId = f.sessions[0].sessionId
      if (!sessionId) throw new Error('test setup failed')
      const before = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'clientSessionId', value: clientSessionId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        limit: 100,
        offset: 0,
      })
      const userSessionsNew = unwrap(before).entities.items.map((s) => ({
        ...s,
        endedAt: UnixMs.now(),
      }))
      await f.userSessionDb.upsert({ entities: userSessionsNew })
      const sessionIds = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'userId', value: userId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        limit: 100,
        offset: 0,
      })
      expect(unwrap(sessionIds).entities.items).toEqual(f.sessions.filter((s) => s.userId === userId))
      const expected = f.sessions
        .filter((s) => s.userId === userId && s.sessionId !== f.sessions[0].sessionId)
        .flatMap((s) => (s.sessionId ? [s.sessionId] : []))
      expect(unwrap(sessionIds).entities.items.map((s) => s.sessionId)).toEqual(expected)
    }
  })

  test('query equals userId', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const before = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'userId', value: userId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        limit: 100,
        offset: 0,
      })
      const userSessionsNew = unwrap(before).entities.items.map((s) => ({
        ...s,
        endedAt: UnixMs.now(),
      }))
      await f.userSessionDb.upsert({ entities: userSessionsNew })
      const sessionIds = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'userId', value: userId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        limit: 100,
        offset: 0,
      })
      expect(unwrap(sessionIds).entities.items).toEqual(f.sessions.filter((s) => s.userId === userId))
      const expected = f.sessions
        .filter((s) => s.userId === userId && s.sessionId !== f.sessions[0].sessionId)
        .flatMap((s) => (s.sessionId ? [s.sessionId] : []))
      expect(unwrap(sessionIds).entities.items.map((s) => s.sessionId)).toEqual(expected)
    }
  })

  test('query equals userId with pagination', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const before = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'userId', value: userId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        limit: 100,
        offset: 0,
        orderBy: [{ column: 'createdAt', direction: 'asc' }],
      })

      const expected: UserSession[] = []
      for (let i = 0; i < 10; i++) {
        const session = UserSession.random({
          userId,
          createdAt: UnixMs.future(UnixMs.now(), TimeSpan.seconds(i)),
        })
        await f.userSessionDb.upsert({ entities: [session] })
        expected.push(session)
        await f.userSessionDb.upsert({ entities: [UserSession.random()] })
      }

      expected.sort((a, b) => a.createdAt - b.createdAt)

      const after = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'userId', value: userId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        limit: 100,
        offset: 0,
        orderBy: [{ column: 'createdAt', direction: 'asc' }],
      })

      expect(unwrap(before)).toEqual({
        entities: {
          items: [],
          total: 0,
          limit: 100,
          offset: 0,
        },
        related: {},
      })

      expect(unwrap(after)).toEqual({
        entities: {
          items: expected,
          total: expected.length,
          limit: 100,
          offset: 0,
        },
        related: {},
      })
    }
  })

  test('query equals sessionId', async () => {
    for (const f of await Fixtures()) {
      const sessionId = SessionId.generate()
      const before = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'sessionId', value: sessionId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        limit: 100,
        offset: 0,
        orderBy: [{ column: 'createdAt', direction: 'asc' }],
      })

      const expected: UserSession[] = []
      for (let i = 0; i < 10; i++) {
        const session = UserSession.random({
          sessionId,
          createdAt: UnixMs.future(UnixMs.now(), TimeSpan.seconds(i)),
        })
        await f.userSessionDb.upsert({ entities: [session] })
        expected.push(session)
        await f.userSessionDb.upsert({ entities: [UserSession.random()] })
      }

      expected.sort((a, b) => a.createdAt - b.createdAt)

      const after = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'sessionId', value: sessionId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        limit: 100,
        offset: 0,
        orderBy: [{ column: 'createdAt', direction: 'asc' }],
      })

      expect(unwrap(before)).toEqual({
        entities: {
          items: [],
          total: 0,
          limit: 100,
          offset: 0,
        },
        related: {},
      })

      expect(unwrap(after)).toEqual({
        entities: {
          items: expected,
          total: expected.length,
          limit: 100,
          offset: 0,
        },
        related: {},
      })
    }
  })

  test('upsert should insert if not exists', async () => {
    for (const f of await Fixtures()) {
      const session = UserSession.random()
      const inserted = await f.userSessionDb.upsert({ entities: [session] })
      const before = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'userId', value: session.userId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        orderBy: [],
        limit: 1,
        offset: 0,
      })
      const sessionNew: UserSession = {
        ...session,
        clientSessionId: ClientSessionId.generate(),
      }
      const updated = await f.userSessionDb.upsert({ entities: [sessionNew] })
      const after = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'userId', value: session.userId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        orderBy: [],
        limit: 1,
        offset: 0,
      })
      expect(unwrap(inserted).entities).toEqual([session])
      expect(unwrap(updated).entities).toEqual([sessionNew])
      expect(unwrap(before).entities.items).toEqual([session])
      expect(unwrap(after).entities.items).toEqual([sessionNew])
    }
  })

  test('query equals clientSessionId', async () => {
    for (const f of await Fixtures()) {
      const clientSessionId = ClientSessionId.generate()

      const before = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'clientSessionId', value: clientSessionId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        limit: 100,
        offset: 0,
        orderBy: [{ column: 'createdAt', direction: 'asc' }],
      })

      const expected: UserSession[] = []
      for (let i = 0; i < 10; i++) {
        const session = UserSession.random({
          clientSessionId,
          createdAt: UnixMs.future(UnixMs.now(), TimeSpan.seconds(i)),
        })
        await f.userSessionDb.upsert({ entities: [session] })
        expected.push(session)
        await f.userSessionDb.upsert({ entities: [UserSession.random()] })
      }

      expected.sort((a, b) => a.createdAt - b.createdAt)

      const after = await f.userSessionDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'clientSessionId', value: clientSessionId },
            { op: '=', column: 'endedAt', value: null },
          ],
        },
        limit: 100,
        offset: 0,
        orderBy: [{ column: 'createdAt', direction: 'asc' }],
      })

      expect(unwrap(before)).toEqual({
        entities: {
          items: [],
          total: 0,
          limit: 100,
          offset: 0,
        },
        related: {},
      })

      expect(unwrap(after)).toEqual({
        entities: {
          items: expected,
          total: expected.length,
          limit: 100,
          offset: 0,
        },
        related: {},
      })
    }
  })
})
