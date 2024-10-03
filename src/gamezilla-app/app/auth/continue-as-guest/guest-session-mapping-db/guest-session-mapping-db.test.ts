import { describe, expect, it } from 'bun:test'
import { GuestSessionMappingDb } from './guest-session-mapping-db-impl'
import { SessionId, UserId } from 'gamezilla-app/app/@/data'
import { unwrap } from 'gamezilla-app/@/core'
import { AppServerTestEnv } from 'gamezilla-app/app/@/server/server-test-env'

const Fixture = async () => {
  const testEnv = await AppServerTestEnv()
  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      const guestSessionMappingDb = GuestSessionMappingDb({
        t: 'postgres',
        dbConnSql: testEnv.dbConnSql
      })

      return {
        guestSessionMappingDb
      }
    }

    case 'unit': {
      const guestSessionMappingDb = GuestSessionMappingDb({
        t: 'hash-map'
      })

      return {
        guestSessionMappingDb
      }
    }
  }
}

describe(import.meta.file, () => {
  it('should insert correctly', async () => {
    const f = await Fixture()

    const sessionId = SessionId.generate()
    const guestUserId = UserId.generate()

    const before = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionId))

    await f.guestSessionMappingDb.insert({
      guestUserId,
      sessionId
    })

    const after = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionId))

    expect(before).toBeNull()
    expect(after).toBe(guestUserId)
  })

  it('should let guest have many sessions', async () => {
    const f = await Fixture()

    const sessionIdA = SessionId.generate()
    const sessionIdB = SessionId.generate()
    const sessionIdC = SessionId.generate()
    const guestUserId = UserId.generate()

    await f.guestSessionMappingDb.insert({
      guestUserId,
      sessionId: sessionIdA
    })
    await f.guestSessionMappingDb.insert({
      guestUserId,
      sessionId: sessionIdB
    })
    await f.guestSessionMappingDb.insert({
      guestUserId,
      sessionId: sessionIdC
    })

    const userIdA = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionIdA))
    const userIdB = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionIdB))
    const userIdC = unwrap(await f.guestSessionMappingDb.findUserIdBySessionId(sessionIdC))

    expect(userIdA).toBe(guestUserId)
    expect(userIdB).toBe(guestUserId)
    expect(userIdC).toBe(guestUserId)
  })
})
