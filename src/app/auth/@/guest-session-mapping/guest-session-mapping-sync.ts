import { ILogger } from '~/@/logger'
import { Err, isErr, Ok } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync'
import { GuestSessionMapping } from './guest-session-mapping'
import { IGuestSessionMappingDb } from './guest-session-mapping-db/interface'
import { GuestSessionMappingId } from './guest-session-mapping-id'

export const GuestSessionMappingSync = (config: {
  guestSessionMappingDb: IGuestSessionMappingDb
  logger: ILogger
}): ISync => {
  const logger = config.logger.child(['guest-session-mapping-sync'])

  return {
    match({ entry }) {
      return GuestSessionMappingId.is(entry.id)
    },
    async push({ entry, sessionId, clientSessionId }) {
      logger.debug('Pushing guest session mapping', { id: entry.id })

      const guestSessionMapping = GuestSessionMapping.fromUnknown(entry.newData)

      if (isErr(guestSessionMapping)) {
        logger.error('Failed to parse guest session mapping', { error: guestSessionMapping.error })
        return Err(guestSessionMapping.error)
      }

      const upserted = await config.guestSessionMappingDb.upsert({
        ...guestSessionMapping.value,
        sessionId,
        clientSessionId,
      })

      if (isErr(upserted)) {
        logger.error('Failed to upsert guest session mapping', { error: upserted.error })
        return Err(upserted.error)
      }

      logger.debug('Successfully pushed guest session mapping', { id: entry.id })
      return Ok(null)
    },
    async pull(_input) {
      return Ok({ entries: [] })
    },
  }
}
