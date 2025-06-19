import { Ok } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { IUserAccountDb } from './user-account-db/interface'

export const UserAccountSync = (_config: { userAccountDb: IUserAccountDb }): ISync => {
  return {
    match({ entry }) {
      return UserId.is(entry.id)
    },
    async push({ entry }) {
      const account = UserAccount.fromUnknown(entry.newData)

      console.log('account', account)

      return Ok(null)
    },
    async pull() {
      return Ok({ entries: [] })
    },
  }
}
