import { isErr, Ok } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync'
import { UserProfile } from '~/app/@/data/user-profile'
import { UserProfileId } from '~/app/@/data/user-profile-id'
import { IUserProfileDb } from './user-profile-db/interface'

export const UserProfileSync = (_config: { profileDb: IUserProfileDb }): ISync => {
  return {
    match({ entry }) {
      return UserProfileId.is(entry.id)
    },
    async push({ entry }) {
      const profile = UserProfile.fromUnknown(entry)

      if (isErr(profile)) return profile

      return Ok(null)
    },
    async pull() {
      return Ok({ entries: [] })
    },
  }
}
