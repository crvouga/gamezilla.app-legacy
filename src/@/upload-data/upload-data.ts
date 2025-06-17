import { Result } from '../result'
import { CrudTransactionEntry } from './crud-transaction-entry'

export type IUploadData = {
  match: (entry: CrudTransactionEntry) => boolean
  upload: (entry: CrudTransactionEntry) => Promise<Result<string, null>>
}
