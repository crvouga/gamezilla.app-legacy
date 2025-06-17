import { Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { IUserProfileDb } from './interface'

export const UploadData = (_config: { profileDb: IUserProfileDb }): IUploadData => {
  return {
    match: (entry) => {
      return entry.id.startsWith('user-profile:')
    },
    upload: async (_entry) => {
      return Ok(null)
    },
  }
}
