import { Result } from '../result'
import { UnixMs } from '../time/unix-ms'
import { ClientSessionId } from '../wire/client-session-id'
import { SessionId } from '../wire/session-id'
import { CrudTransaction } from './crud-transaction/crud-transaction'
import { ISyncEntry } from './sync-entry'

export type ISyncEngine = {
  /**
   * Uploads a list of changes.
   */
  push(input: {
    sessionId: SessionId
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
  registerSync(handler: ISyncEntry): void
}
