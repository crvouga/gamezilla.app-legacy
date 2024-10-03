import type { ISpacesCoreServer } from './spaces-core-server'
import * as ImplDbConnKv from './spaces-core-server-impl-db-conn-kv'

export type Impl = ImplDbConnKv.Config

export const SpacesCoreServer = (impl: Impl): ISpacesCoreServer => {
  switch (impl.t) {
    case 'db-conn-kv':
      return ImplDbConnKv.SpacesCoreServer(impl)
  }
}
