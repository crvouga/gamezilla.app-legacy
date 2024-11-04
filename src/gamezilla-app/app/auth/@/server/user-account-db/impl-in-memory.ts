import { Err, Ok, PhoneNumber } from 'gamezilla-app/@/core'
import type { UserId } from 'gamezilla-app/app/@/data'
import type { UserAccount } from 'gamezilla-app/app/@/data/account'
import type { IUserAccountDb } from './interface'

export type Config = {
  t: 'in-memory'
  delay: () => Promise<void>
}

export const UserAccountDb = (config: Config): IUserAccountDb => {
  const accounts = new Map<UserId, UserAccount>()
  return {
    async findOneByUserId(input) {
      await config.delay()
      return Ok(input.userId ? accounts.get(input.userId) ?? null : null)
    },

    async findOneByPhoneNumber(input) {
      await config.delay()
      for (const account of accounts.values()) {
        if (!account.phoneNumber) continue

        const match = PhoneNumber.toString(account.phoneNumber) === PhoneNumber.toString(input.phoneNumber)

        if (!match) {
          continue
        }

        return Ok(account)
      }

      return Ok(null)
    },

    async insert(input) {
      await config.delay()
      const existing = accounts.get(input.account.userId)
      if (existing) {
        return Err('Can not insert account that already exists.')
      }
      accounts.set(input.account.userId, input.account)
      return Ok(null)
    }
  }
}
