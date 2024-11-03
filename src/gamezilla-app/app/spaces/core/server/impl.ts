import * as ImplDbConnKv from './impl-db-conn-kv'
import * as ImplStream from './impl-stream'
import type { ISpacesCoreServer } from './interface'

export type Config = ImplDbConnKv.Config | ImplStream.Config

export const SpacesCoreServer = async (config: Config): Promise<ISpacesCoreServer> => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.SpacesCoreServer(config)
    }
    case 'stream': {
      return ImplStream.SpacesCoreServer(config)
    }
  }
}
