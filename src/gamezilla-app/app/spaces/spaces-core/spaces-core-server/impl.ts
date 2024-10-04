import type { ISpacesCoreServer } from './interface'
import * as ImplDbConnKv from './impl-db-conn-kv'

export type Impl = ImplDbConnKv.Config

export const SpacesCoreServer = (impl: Impl): ISpacesCoreServer => {
  switch (impl.t) {
    case 'db-conn-kv':
      return ImplDbConnKv.SpacesCoreServer(impl)
  }
}
