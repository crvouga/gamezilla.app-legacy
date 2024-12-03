import * as ImplInMemory from './impl-in-memory'
import * as ImplPostgres from './impl-postgres'
import type { IUserAccountDb } from './interface'

export type Impl = ImplInMemory.Config | ImplPostgres.Config

export const UserAccountDb = (impl: Impl): IUserAccountDb => {
  switch (impl.t) {
    case 'in-memory': {
      return ImplInMemory.UserAccountDb(impl)
    }

    case 'postgres': {
      return ImplPostgres.UserAccountDb(impl)
    }
  }
}
