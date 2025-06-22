import type { Task } from '~/@/promise/task'
import { PhoneNumber } from '~/@/phone-number'
import type { UserId } from '~/app/@/data/user-id'
import type { UserAccount } from '~/app/@/data/user-account'

export type IUserAccountDb = {
  findOneByPhoneNumber: (input: { phoneNumber: PhoneNumber }) => Task<string, UserAccount | null>
  findOneByUserId: (input: { userId: UserId | null }) => Task<string, UserAccount | null>
  upsert: (input: UserAccount) => Task<string, null>
}
