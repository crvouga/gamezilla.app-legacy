import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Account } from "gamezilla-app/@CHILD/app/@SHARED/data/account"
import { Ok } from "gamezilla-app/@SHARED/core"
import { IAccountDb } from "./account-db"

export const AccountDbInMemory = (deps: {
  delay: () => Promise<void>
}): IAccountDb => {
  const accounts = new Map<UserId, Account>()
  return {
    async findOneByUserId(input) {
      await deps.delay()
      return Ok(input.userId ? accounts.get(input.userId) ?? null : null)
    },
    async findOneByEmailAddress(input) {
      await deps.delay()
      for (const account of accounts.values()) {
        if (account.emailAddress === input.emailAddress) {
          return Ok(account)
        }
      }
      return Ok(null)
    },

    async findOneByPhoneNumber(input) {
      await deps.delay()
      for (const account of accounts.values()) {
        if (account.phoneNumber === input.phoneNumber) {
          return Ok(account)
        }
      }
      return Ok(null)
    },

    async insert(input) {
      await deps.delay()
      accounts.set(input.userId, input)
      return Ok(null)
    },
  }
}
