import { Logger } from '~/@/logger'
import { PhoneNumber } from '~/@/phone-number'
import { isOk, unwrap } from '~/@/result'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { describe, expect, test } from '~/@/test-runner'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { UserAccountDb } from './impl'

const Fixture = async (config: UserAccountDb) => {
  const userAccountDb = await UserAccountDb.init(config)
  const userId = UserId.generate()
  const accounts: [UserAccount, ...UserAccount[]] = [
    UserAccount.random({ userId }),
    UserAccount.random({ userId }),
    UserAccount.random({ userId }),
    UserAccount.random(),
    UserAccount.random(),
    UserAccount.random(),
  ]
  await userAccountDb.upsert({ entities: accounts })

  return {
    userAccountDb,
    userId,
    accounts,
  }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()
  const configs: UserAccountDb[] = []

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

describe('UserAccountDb', () => {
  test('should insert correctly', async () => {
    for (const f of await Fixtures()) {
      const userAccount = UserAccount.random()
      if (!userAccount.userId) throw new Error('test setup failed')

      const before = await f.userAccountDb.query({
        limit: 100,
        offset: 0,
        where: {
          op: 'and',
          clauses: [
            {
              op: '=',
              column: 'userId',
              value: userAccount.userId,
            },
          ],
        },
      })

      const inserted = await f.userAccountDb.upsert({ entities: [userAccount] })

      const after = await f.userAccountDb.query({
        limit: 100,
        offset: 0,
        where: {
          op: 'and',
          clauses: [{ op: '=', column: 'userId', value: userAccount.userId }],
        },
      })
      expect(unwrap(before).entities.items).toEqual([])
      if (isOk(inserted)) {
        expect(inserted.value.entities).toEqual([userAccount])
      } else {
        throw new Error(`Upsert failed: ${JSON.stringify(inserted)}`)
      }
      expect(unwrap(after).entities.items).toEqual([userAccount])
    }
  })

  test('should find accounts by user id', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const accounts = await f.userAccountDb.query({
        where: {
          op: 'and',
          clauses: [{ op: '=', column: 'userId', value: userId }],
        },
        limit: 100,
        offset: 0,
      })
      expect(accounts.t).toEqual('ok')
      const expected = f.accounts.filter((a) => a.userId === userId)
      expect(unwrap(accounts).entities.items).toEqual(expected)
    }
  })

  test('query equals userId with pagination', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()
      const before = await f.userAccountDb.query({
        where: {
          op: 'and',
          clauses: [{ op: '=', column: 'userId', value: userId }],
        },
        limit: 100,
        offset: 0,
        orderBy: [{ column: 'createdAt', direction: 'asc' }],
      })

      const account = UserAccount.random({ userId })
      await f.userAccountDb.upsert({ entities: [account] })

      const after = await f.userAccountDb.query({
        where: {
          op: 'and',
          clauses: [{ op: '=', column: 'userId', value: userId }],
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
          items: [account],
          total: 1,
          limit: 100,
          offset: 0,
        },
        related: {},
      })
    }
  })

  test('upsert should update if exists', async () => {
    for (const f of await Fixtures()) {
      const account = UserAccount.random()
      const inserted = await f.userAccountDb.upsert({ entities: [account] })
      const before = await f.userAccountDb.query({
        where: {
          op: 'and',
          clauses: [{ op: '=', column: 'userId', value: account.userId }],
        },
        orderBy: [],
        limit: 1,
        offset: 0,
      })
      const accountNew: UserAccount = {
        ...account,
        phoneNumber: PhoneNumber.random(),
      }
      const updated = await f.userAccountDb.upsert({ entities: [accountNew] })
      const after = await f.userAccountDb.query({
        where: {
          op: 'and',
          clauses: [{ op: '=', column: 'userId', value: account.userId }],
        },
        orderBy: [],
        limit: 1,
        offset: 0,
      })
      expect(unwrap(inserted).entities).toEqual([account])
      expect(unwrap(updated).entities).toEqual([accountNew])
      expect(unwrap(before).entities.items).toEqual([account])
      expect(unwrap(after).entities.items).toEqual([accountNew])
    }
  })
})
