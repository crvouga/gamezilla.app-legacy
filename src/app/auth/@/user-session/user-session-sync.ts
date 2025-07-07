import { ILogger } from '~/@/logger'
import { Err, isErr, Ok } from '~/@/result'
import { ParseError } from '~/@/schema/schema/parse-error'
import { ISyncEntry } from '~/@/sync-engine/sync-entry'
import { UserSession } from './user-session'
import { IUserSessionDb } from './user-session-db/interface'
import { UserSessionId } from './user-session-id'

export const UserSessionSync = (config: { userSessionDb: IUserSessionDb; logger: ILogger }): ISyncEntry => {
  const logger = config.logger.child(['user-session-sync'])

  return {
    match({ entry }) {
      logger.debug(`match: id=${entry.id}`)
      return UserSessionId.is(entry.id)
    },
    async push({ entry, sessionId }) {
      logger.debug(`push: id=${entry.id}`)

      switch (entry.op) {
        case 'create': {
          const userSession = UserSession.fromUnknown(entry.newData)

          if (isErr(userSession)) {
            logger.error(`push: failed to parse user session: ${userSession.error}`)
            return Err(userSession.error)
          }

          const inserted = await config.userSessionDb.upsert({
            ...userSession.value,
            sessionId,
          })

          if (isErr(inserted)) {
            logger.error(`push: failed to upsert user session: ${inserted.error}`)
            return Err(inserted.error)
          }
          return Ok(null)
        }

        case 'update': {
          const userSessionId = UserSessionId.parse(entry.id)
          if (isErr(userSessionId)) {
            logger.error(`push: failed to parse user session id: ${userSessionId.error}`)
            return Err(ParseError.toString(userSessionId.error))
          }
          const updates = UserSession.fromUnknownPartial(entry.newData)
          if (isErr(updates)) {
            logger.error(`push: failed to parse user session: ${updates.error}`)
            return Err(updates.error)
          }
          const updated = await config.userSessionDb.update({
            userSessionId: userSessionId.value,
            updates: updates.value,
          })
          if (isErr(updated)) {
            logger.error(`push: failed to update user session: ${updated.error}`)
            return Err(updated.error)
          }
          return updated
        }

        case 'delete': {
          logger.debug(`push: delete: id=${entry.id}`)
          logger.info('delete is not supported for user session')
          return Ok(null)
        }
      }
    },
    async pull() {
      logger.debug('pull')
      return Ok({ entries: [] })
    },
  }
}
