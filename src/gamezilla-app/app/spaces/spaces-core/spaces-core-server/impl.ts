import * as ImplDbConnKv from './impl-db-conn-kv'
import type { ISpacesCoreServer } from './interface'

export type Config = ImplDbConnKv.Config

export const SpacesCoreServer = async (impl: Config): Promise<ISpacesCoreServer> => {
  switch (impl.t) {
    case 'db-conn-kv':
      return ImplDbConnKv.SpacesCoreServer(impl)
  }
}
