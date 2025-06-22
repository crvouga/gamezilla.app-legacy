import { ILogger } from '../logger'
import { isErr, Ok } from '../result'
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
      logger.debug('Pushing data', { crudTransaction: input.crudTransaction })

      for (const entry of input.crudTransaction.entries) {
        logger.debug('Processing entry', { collection: entry.collection, id: entry.id, op: entry.op })

        for (const sync of config.syncRegistry) {
          const isMatch = sync.match({ entry })

          if (!isMatch) {
            continue
          }

          logger.debug('Found matching push handler', { collection: entry.collection })

          const pushed = await sync.push({
            sessionId: input.sessionId,
            clientSessionId: input.clientSessionId,
            entry,
          })

          if (isErr(pushed)) {
            logger.error('Failed to push entry', { error: pushed, collection: entry.collection, id: entry.id })

            return pushed
          }

          logger.debug('Successfully pushed entry', { collection: entry.collection, id: entry.id })
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
