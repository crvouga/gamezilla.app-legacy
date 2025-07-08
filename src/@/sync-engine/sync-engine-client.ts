import { isErr, Ok, Result } from '~/@/result'
import { ILogger } from '../logger'
import { UnixMs } from '../time/unix-ms'
import { ClientSessionId } from '../wire/client-session-id'
import { SessionId } from '../wire/session-id'
import { ICrudTransactionDb } from './crud-transaction-db/interface'
import { CrudTransaction } from './crud-transaction/crud-transaction'
import { ISync } from './sync-transaction'

export type ISyncEngineClient = {
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
  crudTransactionDb: ICrudTransactionDb
}

export const SyncEngineClient = (config: Config): ISyncEngineClient => {
  const logger = config.logger.child(['impl-client'])

  const pushDataRegistry = new Set<ISync>()

  return {
    registerSync(handler) {
      pushDataRegistry.add(handler)
    },
    async push(input) {
      logger.debug(`Pushing data crudTransaction=${JSON.stringify(input.crudTransaction)}`)

      const pushed = await config.crudTransactionDb.push(input.crudTransaction)

      if (isErr(pushed)) return pushed

      logger.debug('Successfully pushed all entries')

      return Ok(null)
    },
    async pull(_input) {
      throw new Error('Not implemented')
    },
  }
}
