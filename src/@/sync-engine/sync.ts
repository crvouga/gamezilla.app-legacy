import { Result } from '../result'
import { UnixMs } from '../time/unix-ms'
import { ClientSessionId } from '../wire/client-session-id'
import { SessionId } from '../wire/session-id'
import { CrudTransaction } from './crud-transaction/crud-transaction'
import { CrudTransactionEntry } from './crud-transaction/crud-transaction-entry'

export type ISync = {
  match(input: { entry: CrudTransactionEntry }): boolean

  push(input: {
    sessionId: SessionId
    clientSessionId: ClientSessionId
    entry: CrudTransactionEntry
  }): Promise<Result<string, null>>

  pull(input: {
    sessionId: SessionId
    clientSessionId: ClientSessionId
    lastPulledAt: UnixMs
    query: unknown
  }): Promise<Result<string, CrudTransaction>>
}

export const SYNC_REGISTRY = new Set<ISync>()
