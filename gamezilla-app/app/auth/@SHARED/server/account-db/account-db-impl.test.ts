import { describe, expect, it } from "bun:test"
import { UserId } from "gamezilla-app/app/@SHARED/data"
import { UserAccount } from "gamezilla-app/app/@SHARED/data/account"
import { DbConnSql } from "gamezilla-app/app/@SHARED/server/db-conn-sql"
import { Posix, Result } from "gamezilla-app/@SHARED/core"
import { Hashing } from "gamezilla-app/@SHARED/hashing"
import { AccountDb } from "./account-db-impl"
import { Logger } from "gamezilla-app/app/@SHARED/server/logger"

const Fixture = async () => {
  const IS_INTEGRATION_TEST = process.env["IS_INTEGRATION_TEST"]

  const hashing = Hashing({ t: "bun" })

  if (IS_INTEGRATION_TEST) {
    const DATABASE_URL = process.env["DATABASE_URL"]

    if (!DATABASE_URL) {
      throw new Error(`DATABASE_URL not set`)
    }

    const dbConnSql = await DbConnSql({
      databaseUrl: DATABASE_URL,
      logger: Logger({ t: "noop" }),
    })

    const accountDb = AccountDb({
      t: "postgres",
      dbConnSql,
    })

    return {
      hashing,
      accountDb,
    }
  }

  const accountDb = AccountDb({ t: "in-memory", async delay() {} })

  return {
    hashing,
    accountDb,
  }
}

describe(import.meta.file, () => {
  it("should be able to insert accounts", async () => {
    const f = await Fixture()
    const inserted = await f.accountDb.insert({
      account: {
        userId: UserId.generate(),
        role: "guest",
        createdAt: Posix.now({
          precision: "seconds",
        }),
      },
    })
    expect(inserted.t).toBe("ok")
  })

  it("should be able to find account by user id", async () => {
    const f = await Fixture()
    const account: UserAccount = {
      userId: UserId.generate(),
      role: "guest",
      createdAt: Posix.now({
        precision: "seconds",
      }),
    }
    await f.accountDb.insert({ account })
    const found = await f.accountDb.findOneByUserId({ userId: account.userId })
    const maybeAccount = Result.withDefault(found, null)
    expect(maybeAccount).toEqual(account)
  })

  it("should be able to find account by phone number hash", async () => {
    const f = await Fixture()
    const account: UserAccount = {
      userId: UserId.generate(),
      role: "guest",
      createdAt: Posix.now({
        precision: "seconds",
      }),
    }
    const phoneNumberHash = await f.hashing.hash({
      algo: {
        t: "bcrypt",
        cost: 10,
      },
      password: "+14802098698",
    })
    const inserted = await f.accountDb.insert({ account, phoneNumberHash })
    const found = await f.accountDb.findOneByPhoneNumberHash({
      phoneNumberHash,
    })
    const maybeAccount = Result.withDefault(found, null)
    expect(inserted.t).toBe("ok")
    expect(maybeAccount).toEqual(account)
  })
})
