import { Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { IUserSessionDb } from './interface'

export const UploadData = (_config: { userSessionDb: IUserSessionDb }): IUploadData => {
  return {
    match: (entry) => {
      return entry.id.startsWith('user-session:')
    },
    upload: async (_entry) => {
      return Ok(null)
    },
  }
}
