import type { ISpaceCoreDb } from './space-db'
import * as ImplDbConnKv from './space-db-impl-db-conn-kv'

export type SpaceCoreDbImpl = ImplDbConnKv.Deps & {
  t: 'db-conn-kv'
}

export const SpaceCoreDb = (impl: SpaceCoreDbImpl): ISpaceCoreDb => {
  switch (impl.t) {
    case 'db-conn-kv':
      return ImplDbConnKv.SpacesDb(impl)
  }
}
