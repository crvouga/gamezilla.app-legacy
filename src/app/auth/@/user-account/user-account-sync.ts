import { ILogger } from '~/@/logger'
import { Err, isErr, Ok } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { IUserAccountDb } from './user-account-db/interface'

export const UserAccountSync = (config: { userAccountDb: IUserAccountDb; logger: ILogger }): ISync => {
  const logger = config.logger.child(['user-account-sync'])

  return {
    match({ entry }) {
      logger.debug('Matching entry', { id: entry.id })
      return UserId.is(entry.id)
    },
    async push({ entry }) {
      logger.debug('Pushing user account', { id: entry.id })

      const account = UserAccount.fromUnknown(entry.newData)

      if (isErr(account)) {
        logger.error('Failed to parse user account', { error: account.error })
        return Err(account.error)
      }

      const upserted = await config.userAccountDb.upsert(account.value)

      if (isErr(upserted)) {
        logger.error('Failed to upsert user account', { error: upserted.error })
        return Err(upserted.error)
      }

      logger.debug('Successfully pushed user account', { id: entry.id })
      return Ok(null)
    },
    async pull() {
      logger.debug('Pulling user accounts')
      return Ok({ entries: [] })
    },
  }
}
