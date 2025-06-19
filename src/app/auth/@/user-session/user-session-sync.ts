import { Err, isErr, Ok } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync'
import { UserSession } from './user-session'
import { IUserSessionDb } from './user-session-db/interface'
import { UserSessionId } from './user-session-id'

export const UserSessionSync = (_config: { userSessionDb: IUserSessionDb }): ISync => {
  return {
    match({ entry }) {
      return UserSessionId.is(entry.id)
    },
    async push({ entry }) {
      const userSession = UserSession.fromUnknown(entry.newData)

      if (isErr(userSession)) {
        return Err(userSession.error)
      }

      return Ok(null)
    },
    async pull() {
      return Ok({ entries: [] })
    },
  }
}
