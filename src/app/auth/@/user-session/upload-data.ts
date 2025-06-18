import { Err, isErr, Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/interface'
import { UserSession } from './user-session'
import { IUserSessionDb } from './user-session-db/interface'
import { UserSessionId } from './user-session-id'

export const UploadDataUserSession = (_config: { userSessionDb: IUserSessionDb }): IUploadData => {
  return {
    match({ entry }) {
      return UserSessionId.is(entry.id)
    },
    async upload({ entry }) {
      const userSession = UserSession.fromUnknown(entry.newData)

      if (isErr(userSession)) {
        return Err(userSession.error)
      }

      return Ok(null)
    },
  }
}
