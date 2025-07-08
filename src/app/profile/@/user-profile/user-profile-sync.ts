import { Ok } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync-transaction'
import { IUserProfileDb } from './user-profile-db/interface'

export const UserProfileSync = (_config: { profileDb: IUserProfileDb }): ISync => {
  return {
    async push(_) {
      return Ok(null)
    },
  }
}
