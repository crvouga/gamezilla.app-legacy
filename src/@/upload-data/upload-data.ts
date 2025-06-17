import { Result } from '../result'
import { ClientSessionId } from '../wire/client-session-id'
import { SessionId } from '../wire/session-id'
import { CrudTransactionEntry } from './crud-transaction-entry'

export type UploadDataCtx = {
  sessionId: SessionId
  clientSessionId: ClientSessionId
}

export type IUploadData = {
  match: (input: { ctx: UploadDataCtx; entry: CrudTransactionEntry }) => boolean
  upload: (input: { ctx: UploadDataCtx; entry: CrudTransactionEntry }) => Promise<Result<string, null>>
}
