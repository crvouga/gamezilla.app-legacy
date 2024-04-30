import { UserId } from "gamezilla-app/app/@SHARED/data"
import { UserAccount } from "gamezilla-app/app/@SHARED/data/account"
import { Ok } from "gamezilla-app/@SHARED/core"
import { IAccountDb } from "./account-db"
import { Hash } from "gamezilla-app/@SHARED/hashing"

export const AccountDbInMemory = (deps: {
  delay: () => Promise<void>
}): IAccountDb => {
  const accounts = new Map<UserId, UserAccount>()
  const phoneNumberHashes = new Map<
    UserId,
    { userId: UserId; phoneNumberHash: Hash }
  >()
  return {
    async findOneByUserId(input) {
      await deps.delay()
      return Ok(input.userId ? accounts.get(input.userId) ?? null : null)
    },

    async findOneByPhoneNumberHash(input) {
      await deps.delay()
      for (const phoneNumberHash of phoneNumberHashes.values()) {
        if (
          phoneNumberHash?.phoneNumberHash.value === input.phoneNumberHash.value
        ) {
          const account = accounts.get(phoneNumberHash.userId)
          return Ok(account ?? null)
        }
      }
      return Ok(null)
    },

    async insert(input) {
      await deps.delay()
      accounts.set(input.account.userId, input.account)
      if (input.phoneNumberHash) {
        phoneNumberHashes.set(input.account.userId, {
          userId: input.account.userId,
          phoneNumberHash: input.phoneNumberHash,
        })
      }
      return Ok(null)
    },
  }
}
