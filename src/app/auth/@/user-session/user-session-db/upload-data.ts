import { Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { IUserSessionDb } from './interface'
import { UserSessionId } from '../user-session-id'

export const UploadData = (_config: { userSessionDb: IUserSessionDb }): IUploadData => {
  return {
    match: (entry) => {
      return UserSessionId.is(entry.id)
    },
    upload: async (_entry) => {
      return Ok(null)
    },
  }
}
