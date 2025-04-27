import { describe, expect, it } from 'bun:test'
import { PhoneNumber } from '~/@/phone-number'
import { Ok, Result, unwrap } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import type { UserAccount } from '~/app/@/data/account'
import { UserId } from '~/app/@/data/user-id'
import { Impl, UserAccountDb } from './impl'

const Fixture = async (config: Impl) => {
  const userAccountDb = UserAccountDb(config)
  return {
    userAccountDb,
  }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()
  const configs: Impl[] = []

  // configs.push({ t: 'in-memory', async delay() {} })

  configs.push({
    t: 'with-sql-tables',
    dbConnSql: f.dbConnSqlite,
    userAccountDb: UserAccountDb({ t: 'sql', dbConnSql: f.dbConnSqlite }),
  })

  if (f.t === 'integration') {
    configs.push({ t: 'sql', dbConnSql: f.dbConnPostgres })
  }

  return Promise.all(configs.map(Fixture))
}

describe.only(import.meta.file, () => {
  it('should be able to insert accounts', async () => {
    for (const f of await Fixtures()) {
      const inserted = await f.userAccountDb.insert({
        account: {
          userId: UserId.generate(),
          role: 'guest',
          createdAt: Posix.now({
            precision: 'seconds',
          }),
          phoneNumber: null,
        },
      })
      expect(unwrap(inserted)).toBe(null)
    }
  })

  it('should be able to find account by user id', async () => {
    for (const f of await Fixtures()) {
      const account: UserAccount = {
        userId: UserId.generate(),
        role: 'guest',
        createdAt: Posix.now({
          precision: 'seconds',
        }),
        phoneNumber: null,
      }
      await f.userAccountDb.insert({
        account,
      })
      const found = await f.userAccountDb.findOneByUserId({
        userId: account.userId,
      })
      const maybeAccount = Result.unwrapOr(found, null)
      expect(maybeAccount).toEqual(account)
    }
  })

  it('should be able to find account by phone number', async () => {
    for (const f of await Fixtures()) {
      const phoneNumber = PhoneNumber.random()
      const account: UserAccount = {
        phoneNumber,
        userId: UserId.generate(),
        role: 'normal',
        createdAt: Posix.now({
          precision: 'seconds',
        }),
      }
      const insert = await f.userAccountDb.insert({
        account,
      })
      expect(insert.t).toBe('ok')
      const found = await f.userAccountDb.findOneByPhoneNumber({
        phoneNumber,
      })
      expect(found).toEqual(Ok(account))
    }
  })

  it('should error if after inserting an existing account', async () => {
    for (const f of await Fixtures()) {
      const account: UserAccount = {
        userId: UserId.generate(),
        role: 'guest',
        createdAt: Posix.now({
          precision: 'seconds',
        }),
        phoneNumber: null,
      }
      const insertBefore = await f.userAccountDb.insert({
        account,
      })
      const insert = await f.userAccountDb.insert({
        account,
      })
      expect(unwrap(insertBefore)).toBe(null)
      expect(insert).not.toEqual(Ok(null))
    }
  })

  it('should find null if finding account by user id and null is passed as user id', async () => {
    for (const f of await Fixtures()) {
      const found = await f.userAccountDb.findOneByUserId({
        userId: null,
      })
      expect(found).toEqual(Ok(null))
    }
  })

  it("should find null if user id doesn't exist", async () => {
    for (const f of await Fixtures()) {
      const found = await f.userAccountDb.findOneByUserId({
        userId: UserId.generate(),
      })
      expect(found).toEqual(Ok(null))
    }
  })

  it('should error if inserting an account with the same user id twice', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const account: UserAccount = {
        userId,
        role: 'guest',
        createdAt: Posix.now({
          precision: 'seconds',
        }),
        phoneNumber: null,
      }
      await f.userAccountDb.insert({
        account,
      })
      const insert = await f.userAccountDb.insert({
        account,
      })
      expect(insert.t).toBe('err')
    }
  })
})
