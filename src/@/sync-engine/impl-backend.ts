import { ILogger } from '../logger'
import { Err, isErr, Ok } from '../result'
import { ISync } from './sync'
import { ISyncEngine } from './interface'

export type Config = {
  t: 'backend'
  syncRegistry: Iterable<ISync>
  logger: ILogger
}

export const SyncEngineBackend = (config: Config): ISyncEngine => {
  const logger = config.logger.child(['impl-backend'])

  return {
    async push(input) {
      logger.debug(`Pushing data crudTransaction=${JSON.stringify(input.crudTransaction)}`)

      for (const entry of input.crudTransaction.entries) {
        logger.debug(`Processing entry collection=${entry.collection} id=${entry.id} op=${entry.op}`)

        for (const sync of config.syncRegistry) {
          const isMatch = sync.match({ entry })

          if (!isMatch) {
            continue
          }

          logger.debug(`Found matching push handler collection=${entry.collection}`)

          const pushed = await sync.push({
            sessionId: input.sessionId,
            clientSessionId: input.clientSessionId,
            entry,
          })

          if (isErr(pushed)) {
            logger.error(`Failed to push entry collection=${entry.collection} id=${entry.id} error=${pushed.error}`)

            return Err(
              `Failed to push entry for collection: ${entry.collection}, id: ${entry.id}; error: ${pushed.error}`,
            )
          }

          logger.debug(`Successfully pushed entry collection=${entry.collection} id=${entry.id}`)
          break
        }
      }

      logger.debug('Successfully pushed all entries')

      return Ok(null)
    },
    async pull(_input) {
      throw new Error('Not implemented')
    },
  }
}
