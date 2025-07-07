import { ILogger } from '~/@/logger'
import { Ok } from '~/@/result'
import { ISyncEngine } from './interface'
import { ISyncEntry } from '../sync-entry'

export type Config = {
  t: 'http-client'
  logger: ILogger
}

export const SyncEngineHttpClient = (config: Config): ISyncEngine => {
  const logger = config.logger.child(['impl-http-client'])
  const syncRegistry = new Set<ISyncEntry>()

  return {
    registerSync(handler) {
      syncRegistry.add(handler)
    },
    async push(input) {
      logger.debug('Pushing data', { crudTransaction: input.crudTransaction })

      return Ok(null)
    },
    async pull(_input) {
      throw new Error('Not implemented')
    },
  }
}
