import { describe, expect, it } from 'bun:test'
import { unwrap } from '~/@/result'
import { SessionId } from '~/@/wire/session-id'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { UserId } from '~/app/@/data/user-id'
import { GuestSessionMapping } from '../guest-session-mapping'
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
    sqlDb: f.sqlDbSqlite,
    shouldCreateTables: true,
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql',
      sqlDb: f.sqlDbPostgres,
      shouldCreateTables: false,
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('Test', () => {
  it('should insert correctly', async () => {
    for (const f of await Fixtures()) {
      const guestSessionMapping = GuestSessionMapping.random()

      if (!guestSessionMapping.sessionId) throw new Error('sessionId is null')

      const before = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(guestSessionMapping.sessionId))

      unwrap(await f.guestSessionMappingDb.upsert(guestSessionMapping))

      const after = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(guestSessionMapping.sessionId))

      expect(before).toBeNull()
      expect(after).toBe(guestSessionMapping.guestUserId)
    }
  })

  it('should let guest have many sessions', async () => {
    for (const f of await Fixtures()) {
      const sessionIdA = SessionId.generate()
      const sessionIdB = SessionId.generate()
      const sessionIdC = SessionId.generate()
      const guestUserId = UserId.generate()

      await f.guestSessionMappingDb.upsert(
        GuestSessionMapping.random({
          guestUserId,
          sessionId: sessionIdA,
        }),
      )
      await f.guestSessionMappingDb.upsert(
        GuestSessionMapping.random({
          guestUserId,
          sessionId: sessionIdB,
        }),
      )
      await f.guestSessionMappingDb.upsert(
        GuestSessionMapping.random({
          guestUserId,
          sessionId: sessionIdC,
        }),
      )

      const userIdA = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionIdA))
      const userIdB = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionIdB))
      const userIdC = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionIdC))

      expect(userIdA).toBe(guestUserId)
      expect(userIdB).toBe(guestUserId)
      expect(userIdC).toBe(guestUserId)
    }
  })

  it('should upsert correctly', async () => {
    for (const f of await Fixtures()) {
      const guestSessionMapping = GuestSessionMapping.random()
      const inserted = await f.guestSessionMappingDb.upsert(guestSessionMapping)
      const before = await f.guestSessionMappingDb.findUserIdByClientSessionId(guestSessionMapping.clientSessionId)
      const guestSessionMappingNew: GuestSessionMapping = {
        ...guestSessionMapping,
        guestUserId: UserId.generate(),
      }
      const updated = await f.guestSessionMappingDb.upsert(guestSessionMappingNew)
      const after = await f.guestSessionMappingDb.findUserIdByClientSessionId(guestSessionMappingNew.clientSessionId)
      expect(unwrap(inserted)).toBe(null)
      expect(unwrap(before)).toEqual(guestSessionMapping.guestUserId)
      expect(unwrap(updated)).toBe(null)
      expect(unwrap(after)).toEqual(guestSessionMappingNew.guestUserId)
    }
  })
})
