import { TimeSpan, ok } from "gamezilla/@SHARED/core"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { Account } from "../../../auth.core"
import { IAccountDb } from "./account-db"

export const AccountDbInMemory = ({
  delay,
}: {
  delay: TimeSpan
}): IAccountDb => {
  const accounts = new Map<UserId, Account>()
  return {
    async findOneByEmail(input) {
      await new Promise<null>((resolve) =>
        setTimeout(resolve, TimeSpan.toMilliseconds(delay)),
      )

      for (const account of accounts.values()) {
        if (account.emailAddress === input.emailAddress) {
          return ok(account)
        }
      }
      return ok(null)
    },

    async findOneByPhoneNumber(input) {
      await new Promise<null>((resolve) =>
        setTimeout(resolve, TimeSpan.toMilliseconds(delay)),
      )
      for (const account of accounts.values()) {
        if (account.phoneNumber === input.phoneNumber) {
          return ok(account)
        }
      }
      return ok(null)
    },

    async insert(input) {
      await new Promise<null>((resolve) =>
        setTimeout(resolve, TimeSpan.toMilliseconds(delay)),
      )
      accounts.set(input.userId, input)
      return ok(null)
    },
  }
}
