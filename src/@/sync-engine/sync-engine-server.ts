import { ILogger } from '~/@/logger'
import { Err, isErr, Ok, Result } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync-transaction'
import { UnixMs } from '~/@/time/unix-ms'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { CrudTransaction } from './crud-transaction/crud-transaction'

export type ISyncEngine = {
  /**
   * Uploads a list of changes.
   */
  push(input: {
    sessionId?: SessionId
    clientSessionId: ClientSessionId
    crudTransaction: CrudTransaction
  }): Promise<Result<string, null>>
  /**
   * Returns a list of changes that has happened since the last pull.
   */
  pull(input: {
    sessionId: SessionId
    clientSessionId: ClientSessionId
    query: unknown
    lastPulledAt: UnixMs
  }): Promise<Result<string, CrudTransaction>>
  /**
   * registerPushEntry
   */
  registerSync(handler: ISync): void
}

export type Config = {
  logger: ILogger
}

export const SyncEngineServer = (config: Config): ISyncEngine => {
  const logger = config.logger.child(['impl-http-server'])

  const syncRegistry = new Set<ISync>()

  return {
    registerSync(handler) {
      syncRegistry.add(handler)
    },
    async push(input) {
      logger.debug(`Pushing data crudTransaction=${JSON.stringify(input.crudTransaction)}`)

      for (const entry of input.crudTransaction.entries) {
        logger.debug(`Processing entry collection=${entry.collection} id=${entry.id} op=${entry.op}`)

        for (const sync of syncRegistry) {
          logger.debug(`Found matching push handler collection=${entry.collection}`)

          const pushed = await sync.push({
            meta: {
              sessionId: input.sessionId,
              clientSessionId: input.clientSessionId,
            },
            crudTransaction: input.crudTransaction,
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
