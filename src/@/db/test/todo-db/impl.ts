import { ImplSql } from './impl-sql'
import { ImplHashMap } from './impl-hash-map'
import { ITodoDb } from './interface'

export type TodoDb = ImplSql | ImplHashMap

const init = (self: TodoDb): ITodoDb => {
  switch (self.t) {
    case 'sql-db':
      return ImplSql.init(self)
    case 'hash-map':
      return ImplHashMap.init(self)
  }
}

export const TodoDb = {
  init,
}
