import { PhoneNumber } from '~/@/phone-number'
import { Ok } from '~/@/result'
import type { UserAccount } from '~/app/@/data/user-account'
import type { UserId } from '~/app/@/data/user-id'
import type { IUserAccountDb } from './interface'

export type Config = {
  t: 'in-memory'
  simulateLatency: () => Promise<void>
}

export const UserAccountDb = (config: Config): IUserAccountDb => {
  const accounts = new Map<UserId, UserAccount>()
  return {
    async findOneByUserId(input) {
      await config.simulateLatency()
      return Ok(input.userId ? (accounts.get(input.userId) ?? null) : null)
    },

    async findOneByPhoneNumber(input) {
      await config.simulateLatency()
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

    async upsert(input) {
      await config.simulateLatency()
      accounts.set(input.userId, input)
      return Ok(null)
    },
  }
}
