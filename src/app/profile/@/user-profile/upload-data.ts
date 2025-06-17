import { isErr, Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { UserProfile } from '~/app/@/data/user-profile'
import { UserProfileId } from '~/app/@/data/user-profile-id'
import { IUserProfileDb } from './user-profile-db/interface'

export const UploadDataProfile = (_config: { profileDb: IUserProfileDb }): IUploadData => {
  return {
    match: ({ entry }) => {
      return UserProfileId.is(entry.id)
    },
    upload: async ({ entry }) => {
      const profile = UserProfile.fromUnknown(entry)

      if (isErr(profile)) return profile

      return Ok(null)
    },
  }
}
