import { Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { IUserProfileDb } from './user-profile-db/interface'

export const UploadDataProfile = (_config: { profileDb: IUserProfileDb }): IUploadData => {
  return {
    match: (entry) => {
      return entry.id.startsWith('user-profile:')
    },
    upload: async (_entry) => {
      return Ok(null)
    },
  }
}
