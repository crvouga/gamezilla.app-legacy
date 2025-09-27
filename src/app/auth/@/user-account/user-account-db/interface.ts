import { QueryInput } from '~/@/db/interface/query-input/query-input'
import { PhoneNumber } from '~/@/phone-number'
import type { Task } from '~/@/promise/task'
import type { UserAccount } from '~/app/@/data/user-account'
import type { UserId } from '~/app/@/data/user-id'

export type UserAccountDbQuery = QueryInput<UserAccount>

export type IUserAccountDb = {
  findOneByPhoneNumber: (input: { phoneNumber: PhoneNumber }) => Task<string, UserAccount | null>
  findOneByUserId: (input: { userId: UserId | null }) => Task<string, UserAccount | null>
  upsert: (input: UserAccount) => Task<string, null>
}
