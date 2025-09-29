import { Err, isErr, Ok, Result } from '~/@/result'

import { ILogger } from '../logger'
import { CrudTransaction } from './crud-transaction/crud-transaction'

export type ISync = {
  push(input: {
    //
    meta?: Record<string, unknown>
    crudTransaction: CrudTransaction
  }): Promise<Result<string, null>>
  pull?(input: {
    meta?: Record<string, unknown>
    query: unknown
  }): Promise<Result<string, { entities: unknown[]; total: number }>>
}

export const push = async (config: {
  crudTransaction: CrudTransaction
  syncRegistry: Set<ISync>
  logger: ILogger
  meta?: Record<string, unknown>
}) => {
  const logger = config.logger.child(['push'])
  logger.debug(`Pushing data crudTransaction=${JSON.stringify(config.crudTransaction)}`)

  for (const sync of config.syncRegistry) {
    const pushed = await sync.push({
      meta: config.meta,
      crudTransaction: config.crudTransaction,
    })

    if (isErr(pushed)) {
      logger.error(`Failed to push entry error=${pushed.error}`)

      return Err(`Failed to push entry; error: ${pushed.error}`)
    }

    logger.debug(`Successfully pushed entry`)
    break
  }

  logger.debug('Successfully pushed all entries')

  return Ok(null)
}
