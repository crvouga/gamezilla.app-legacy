import { Result } from '../result'
import { CrudTransaction } from './crud-transaction'

export type IUploadData = {
  match: (transaction: CrudTransaction) => boolean
  upload: (transaction: CrudTransaction) => Promise<Result<string, null>>
}
