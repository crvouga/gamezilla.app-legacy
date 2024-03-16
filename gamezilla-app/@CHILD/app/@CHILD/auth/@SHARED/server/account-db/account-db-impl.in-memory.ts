import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { ok } from "gamezilla-app/@SHARED/core"
import { IAccountDb } from "./account-db"
import { Account } from "gamezilla-app/@CHILD/app/@SHARED/data/account"

export const AccountDbInMemory = (deps: {
  delay: () => Promise<void>
}): IAccountDb => {
  const accounts = new Map<UserId, Account>()
  return {
    async findOneByUserId(input) {
      await deps.delay()
      return ok(input.userId ? accounts.get(input.userId) ?? null : null)
    },
    async findOneByEmail(input) {
      await deps.delay()
      for (const account of accounts.values()) {
        if (account.emailAddress === input.emailAddress) {
          return ok(account)
        }
      }
      return ok(null)
    },

    async findOneByPhoneNumber(input) {
      await deps.delay()
      for (const account of accounts.values()) {
        if (account.phoneNumber === input.phoneNumber) {
          return ok(account)
        }
      }
      return ok(null)
    },

    async insert(input) {
      await deps.delay()
      accounts.set(input.userId, input)
      return ok(null)
    },
  }
}
