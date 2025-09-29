import { ILogger } from '~/@/logger'
import { Err, isErr, Ok } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync-transaction'
import { UserAccount } from '~/app/@/data/user-account'
import { IUserAccountDb } from './user-account-db/interface'

export const UserAccountDbSync = (config: { userAccountDb: IUserAccountDb; logger: ILogger }): ISync => {
  const logger = config.logger.child(['user-account-db-sync'])

  return {
    async push({ crudTransaction }) {
      const account = UserAccount.fromUnknown(crudTransaction.entries[0]!.newData)

      if (isErr(account)) {
        logger.error('Failed to parse user account', { error: account.error })
        return Err(account.error)
      }

      const upserted = await config.userAccountDb.upsert({ entities: [account.value] })

      if (isErr(upserted)) {
        logger.error('Failed to upsert user account', { error: upserted.error })
        return Err(upserted.error.message)
      }

      return Ok(null)
    },
    async pull() {
      throw new Error('Not implemented')
    },
  }
}
