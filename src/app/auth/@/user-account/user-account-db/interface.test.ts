import { describe, expect, test } from '~/@/test-runner'
import { PhoneNumber } from '~/@/phone-number'
import { Ok, Result, unwrap } from '~/@/result'
import { UnixMs } from '~/@/time/unix-ms'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { Impl, UserAccountDb } from './impl'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy'
import { Logger } from '~/@/logger'

const Fixture = async (config: Impl) => {
  const userAccountDb = UserAccountDb(config)
  return {
    userAccountDb,
  }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()
  const configs: Impl[] = []

  configs.push({
    t: 'in-memory',
    simulateLatency: async () => {},
  })

  configs.push({
    t: 'sql',
    sqlDb: f.sqlDbSqlite,
    logger: f.logger,
    migrationPolicy: SqlDbMigrationPolicy({ t: 'always-run', logger: Logger({ t: 'noop' }) }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql',
      sqlDb: f.sqlDbPostgres,
      logger: f.logger,
      migrationPolicy: SqlDbMigrationPolicy({ t: 'always-run', logger: Logger({ t: 'noop' }) }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('UserAccountDb', () => {
  test('should be able to insert accounts', async () => {
    for (const f of await Fixtures()) {
      const inserted = await f.userAccountDb.upsert({
        userId: UserId.generate(),
        role: 'guest',
        createdAt: UnixMs.now({
          precision: 'seconds',
        }),
        phoneNumber: null,
      })
      expect(unwrap(inserted)).toEqual(null)
    }
  })

  test('should be able to find account by user id', async () => {
    for (const f of await Fixtures()) {
      const account: UserAccount = {
        userId: UserId.generate(),
        role: 'guest',
        createdAt: UnixMs.now({
          precision: 'seconds',
        }),
        phoneNumber: null,
      }
      await f.userAccountDb.upsert(account)
      const found = await f.userAccountDb.findOneByUserId({
        userId: account.userId,
      })
      const maybeAccount = Result.unwrapOr(found, null)
      expect(maybeAccount).toEqual(account)
    }
  })

  test('should be able to find account by phone number', async () => {
    for (const f of await Fixtures()) {
      const phoneNumber = PhoneNumber.random()
      const account: UserAccount = {
        phoneNumber,
        userId: UserId.generate(),
        role: 'normal',
        createdAt: UnixMs.now({
          precision: 'seconds',
        }),
      }
      const insert = await f.userAccountDb.upsert(account)
      expect(insert.t).toEqual('ok')
      const found = await f.userAccountDb.findOneByPhoneNumber({
        phoneNumber,
      })
      expect(found).toEqual(Ok(account))
    }
  })

  test('should find null if finding account by user id and null is passed as user id', async () => {
    for (const f of await Fixtures()) {
      const found = await f.userAccountDb.findOneByUserId({
        userId: null,
      })
      expect(found).toEqual(Ok(null))
    }
  })

  test("should find null if user id doesn't exist", async () => {
    for (const f of await Fixtures()) {
      const found = await f.userAccountDb.findOneByUserId({
        userId: UserId.generate(),
      })
      expect(found).toEqual(Ok(null))
    }
  })

  test('should upsert an account', async () => {
    for (const f of await Fixtures()) {
      const account = UserAccount.random()
      const inserted = await f.userAccountDb.upsert(account)
      const before = await f.userAccountDb.findOneByUserId({
        userId: account.userId,
      })
      const accountNew: UserAccount = {
        ...account,
        phoneNumber: PhoneNumber.random(),
      }
      const updated = await f.userAccountDb.upsert(accountNew)
      const found = await f.userAccountDb.findOneByUserId({
        userId: accountNew.userId,
      })
      expect(unwrap(inserted)).toEqual(null)
      expect(unwrap(before)).toEqual(account)
      expect(unwrap(updated)).toEqual(null)
      expect(unwrap(found)).toEqual(accountNew)
    }
  })
})
