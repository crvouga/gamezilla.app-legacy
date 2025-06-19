import { ILogger } from '../logger'
import { isErr, Ok, Result } from '../result'
import { UnixMs } from '../time/unix-ms'
import { ClientSessionId } from '../wire/client-session-id'
import { SessionId } from '../wire/session-id'
import { CrudTransaction } from './crud-transaction/crud-transaction'
import { ISync } from './sync'

export type ISyncEngine = {
  push(input: {
    sessionId: SessionId
    clientSessionId: ClientSessionId
    crudTransaction: CrudTransaction
  }): Promise<Result<string, null>>
  pull(input: {
    sessionId: SessionId
    clientSessionId: ClientSessionId
    query: unknown
    lastPulledAt: UnixMs
  }): Promise<Result<string, CrudTransaction>>
}

export const SyncEngine = (config: { syncRegistry: Iterable<ISync>; logger: ILogger }): ISyncEngine => {
  const logger = config.logger.child(['sync-engine'])

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
