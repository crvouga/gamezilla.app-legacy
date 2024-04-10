import { describe, expect, it } from "bun:test"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { UserAccount } from "gamezilla-app/@CHILD/app/@SHARED/data/account"
import { DbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-sql"
import { loggerNoop } from "gamezilla-app/@CHILD/app/@SHARED/server/logger"
import { Posix, Result } from "gamezilla-app/@SHARED/core"
import { Hashing } from "gamezilla-app/@SHARED/hashing"
import { AccountDb } from "./account-db-impl"

const Fixture = async () => {
  const databaseUrl = process.env["DATABASE_URL"]

  if (!databaseUrl) {
    throw new Error(`DATABASE_URL not set`)
  }

  const dbConnSql = await DbConnSql({ databaseUrl, logger: loggerNoop })

  const accountDb = AccountDb({ t: "postgres", dbConnSql })

  const hashing = Hashing({
    t: "bun",
  })

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

  it.only("should be able to find account by phone number hash", async () => {
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
