import { ImplSqlDb } from './impl-sql-db'
import { ICrudTransactionDb } from './interface'

export type CrudTransactionDb = ImplSqlDb

const init = (config: CrudTransactionDb): ICrudTransactionDb => {
  switch (config.t) {
    case 'sql-db':
      return ImplSqlDb.init(config)
  }
}

export const CrudTransactionDb = {
  init,
}
