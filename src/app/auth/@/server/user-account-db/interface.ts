import type { Task } from '~/@/core'
import { PhoneNumber } from '~/@/phone-number'
import type { UserId } from '~/app/@/data'
import type { UserAccount } from '~/app/@/data/account'

export type IUserAccountDb = {
  findOneByPhoneNumber: (input: { phoneNumber: PhoneNumber }) => Task<string, UserAccount | null>
  findOneByUserId: (input: { userId: UserId | null }) => Task<string, UserAccount | null>
  insert: (input: { account: UserAccount }) => Task<string, null>
}
