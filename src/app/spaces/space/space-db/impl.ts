import { ImplSql } from './impl-sql'
import type { ISpaceDb } from './interface'

export type SpaceDb = ImplSql

const init = (self: SpaceDb): ISpaceDb => {
  switch (self.t) {
    case 'sql-db':
      return ImplSql.init(self)
  }
}

export const SpaceDb = {
  init,
}
