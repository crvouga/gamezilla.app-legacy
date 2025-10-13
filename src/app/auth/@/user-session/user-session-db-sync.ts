import { ILogger } from '~/@/logger'
import { Err, isErr, Ok } from '~/@/result'
import { ParseError } from '~/@/schema/schema/parse-error'
import { ISync } from '~/@/sync-engine/sync-transaction'
import { UserSession } from './user-session'
import { IUserSessionDb } from './user-session-db/interface'
import { UserSessionId } from './user-session-id'

export const UserSessionDbSync = (config: { userSessionDb: IUserSessionDb; logger: ILogger }): ISync => {
  const logger = config.logger.child(['user-session-db-sync'])

  return {
    // @ts-ignore
    async push({ crudTransaction }) {
      const entry = crudTransaction.entries[0]!

      switch (entry.op) {
        case 'create': {
          const userSession = UserSession.fromUnknown(entry.newData)
          // @ts-ignore
          const sessionId = crudTransaction.meta?.sessionId

          if (isErr(userSession)) {
            logger.error(`push: failed to parse user session: ${userSession.error}`)
            return Err(userSession.error)
          }

          const inserted = await config.userSessionDb.upsert({
            entities: [
              {
                ...userSession.value,
                sessionId: sessionId!,
              },
            ],
          })

          if (isErr(inserted)) {
            logger.error(`push: failed to upsert user session: ${inserted.error}`)
            return Err(inserted.error.message)
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
            where: { op: '=', column: 'userSessionId', value: userSessionId.value },
            set: updates.value,
            limit: 1,
            offset: 0,
          })
          if (isErr(updated)) {
            logger.error(`push: failed to update user session: ${updated.error}`)
            return Err(updated.error.message)
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
      throw new Error('Not implemented')
    },
  }
}
