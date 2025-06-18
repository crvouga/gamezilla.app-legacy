import { Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/interface'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { IUserAccountDb } from './user-account-db/interface'

export const UploadDataUserAccount = (_config: { userAccountDb: IUserAccountDb }): IUploadData => {
  return {
    match: ({ entry }) => {
      return UserId.is(entry.id)
    },
    upload: async ({ entry }) => {
      const account = UserAccount.fromUnknown(entry.newData)

      console.log('account', account)

      return Ok(null)
    },
  }
}
