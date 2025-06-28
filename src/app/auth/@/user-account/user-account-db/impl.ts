import * as ImplInMemory from './impl-in-memory'
import * as ImplSql from './impl-sql'
import type { IUserAccountDb } from './interface'

export type Impl = ImplInMemory.Config | ImplSql.Config

export const UserAccountDb = (impl: Impl): IUserAccountDb => {
  switch (impl.t) {
    case 'in-memory': {
      return ImplInMemory.UserAccountDb(impl)
    }

    case 'sql': {
      return ImplSql.UserAccountDb(impl)
    }
  }
}
