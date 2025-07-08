import { Result } from '~/@/result'
import { CrudTransaction } from '../crud-transaction/crud-transaction'

export type ICrudTransactionDb = {
  /**
   * Push a crud transaction to the database.
   */
  push: (crudTransaction: CrudTransaction) => Promise<Result<string, null>>

  /**
   * Mark a crud transaction as committed. Meaning it has been accepted by the backend.
   */
  commit: (crudTransaction: CrudTransaction) => Promise<Result<string, null>>

  /**
   * Return all uncommitted crud transactions.
   */
  uncommitted: () => Promise<Result<string, CrudTransaction[]>>
}
