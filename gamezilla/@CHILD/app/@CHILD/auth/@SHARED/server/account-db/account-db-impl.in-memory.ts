import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { TimeSpan, ok } from "gamezilla/@SHARED/core"
import { Account } from "../../../auth.core"
import { IAccountDb } from "./account-db"

export const AccountDbInMemory = (_deps: { delay: TimeSpan }): IAccountDb => {
  const accounts = new Map<UserId, Account>()
  return {
    async findOneByEmail(input) {
      for (const account of accounts.values()) {
        if (account.emailAddress === input.emailAddress) {
          return ok(account)
        }
      }
      return ok(null)
    },

    async findOneByPhoneNumber(input) {
      for (const account of accounts.values()) {
        if (account.phoneNumber === input.phoneNumber) {
          return ok(account)
        }
      }
      return ok(null)
    },

    async insert(input) {
      accounts.set(input.userId, input)
      return ok(null)
    },
  }
}
