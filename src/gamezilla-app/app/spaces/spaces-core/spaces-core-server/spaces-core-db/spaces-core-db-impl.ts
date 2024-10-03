import type { ISpacesDb } from './spaces-core-db'
import * as ImplDbConnKv from './spaces-core-db-impl-db-conn-kv'

export type Impl = ImplDbConnKv.Config & {
  t: 'db-conn-kv'
}

export const SpacesDb = (impl: Impl): ISpacesDb => {
  switch (impl.t) {
    case 'db-conn-kv':
      return ImplDbConnKv.SpacesDb(impl)
  }
}
