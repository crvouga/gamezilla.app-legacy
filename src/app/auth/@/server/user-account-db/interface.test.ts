import { describe, expect, it } from 'bun:test'
import { Ok, Result } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'
import type { UserAccount } from '~/app/@/data/account'
import { AppBackendTestEnv } from '~/app/@/server/fixture'
import { UserAccountDb } from './impl'
import { Posix } from '~/@/time/posix'
import { PhoneNumber } from '~/@/phone-number'

const Fixture = async () => {
  const testEnv = await AppBackendTestEnv()

  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      return {
        userAccountDb: UserAccountDb({
          t: 'postgres',
          dbConnSql: testEnv.dbConnSql,
        }),
      }
    }

    case 'unit': {
      return {
        userAccountDb: UserAccountDb({
          t: 'in-memory',
          async delay() {},
        }),
      }
    }
  }
}

describe(import.meta.file, () => {
  it('should be able to insert accounts', async () => {
    const f = await Fixture()
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
    expect(inserted.t).toBe('ok')
  })

  it('should be able to find account by user id', async () => {
    const f = await Fixture()
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
  })

  it('should be able to find account by phone number', async () => {
    const f = await Fixture()
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
  })

  it('should error if after inserting an existing account', async () => {
    const f = await Fixture()
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
    const insert = await f.userAccountDb.insert({
      account,
    })
    expect(insert.t).toBe('err')
  })

  it('should find null if finding account by user id and null is passed as user id', async () => {
    const f = await Fixture()
    const found = await f.userAccountDb.findOneByUserId({
      userId: null,
    })
    expect(found).toEqual(Ok(null))
  })

  it('should find null if user id doesnt exist', async () => {
    const f = await Fixture()
    const found = await f.userAccountDb.findOneByUserId({
      userId: UserId.generate(),
    })
    expect(found).toEqual(Ok(null))
  })

  it('should error if inserting an account with the same user id twice', async () => {
    const f = await Fixture()
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
  })
})
