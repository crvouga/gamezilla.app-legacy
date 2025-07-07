import { Result } from '~/@/result'
import { CrudTransaction } from '../crud-transaction/crud-transaction'

export type ITransactionDb = {
  /**
   * Push a list of crud transactions to the database.
   */
  push: (crudTransactions: CrudTransaction[]) => Promise<Result<string, null>>

  /**
   * Pull uncommitted crud transactions from the database.
   */
  pull: () => Promise<Result<string, CrudTransaction[]>>
}
