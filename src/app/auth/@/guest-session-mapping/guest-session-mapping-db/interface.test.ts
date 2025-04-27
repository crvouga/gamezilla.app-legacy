import { describe, expect, it } from 'bun:test'
import { unwrap } from '~/@/result'
import { SessionId } from '~/@/wire/session-id'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { UserId } from '~/app/@/data/user-id'
import { Config, GuestSessionMappingDb } from './impl'

const Fixture = async (config: Config) => {
  const guestSessionMappingDb = GuestSessionMappingDb(config)
  return {
    guestSessionMappingDb,
  }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()
  const configs: Config[] = []

  configs.push({ t: 'hash-map' })

  configs.push({
    t: 'sql',
    dbConnSql: f.dbConnSqlite,
  })

  configs.push({
    t: 'with-sql-tables',
    dbConnSql: f.dbConnSqlite,
    guestSessionMappingDb: GuestSessionMappingDb({ t: 'sql', dbConnSql: f.dbConnSqlite }),
  })

  if (f.t === 'integration') {
    configs.push({ t: 'sql', dbConnSql: f.dbConnPostgres })
  }

  return Promise.all(configs.map(Fixture))
}

describe(import.meta.file, () => {
  it('should insert correctly', async () => {
    for (const f of await Fixtures()) {
      const sessionId = SessionId.generate()
      const guestUserId = UserId.generate()

      const before = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionId))

      await f.guestSessionMappingDb.insert({
        guestUserId,
        sessionId,
      })

      const after = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionId))

      expect(before).toBeNull()
      expect(after).toBe(guestUserId)
    }
  })

  it('should let guest have many sessions', async () => {
    for (const f of await Fixtures()) {
      const sessionIdA = SessionId.generate()
      const sessionIdB = SessionId.generate()
      const sessionIdC = SessionId.generate()
      const guestUserId = UserId.generate()

      await f.guestSessionMappingDb.insert({
        guestUserId,
        sessionId: sessionIdA,
      })
      await f.guestSessionMappingDb.insert({
        guestUserId,
        sessionId: sessionIdB,
      })
      await f.guestSessionMappingDb.insert({
        guestUserId,
        sessionId: sessionIdC,
      })

      const userIdA = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionIdA))
      const userIdB = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionIdB))
      const userIdC = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionIdC))

      expect(userIdA).toBe(guestUserId)
      expect(userIdB).toBe(guestUserId)
      expect(userIdC).toBe(guestUserId)
    }
  })
})
