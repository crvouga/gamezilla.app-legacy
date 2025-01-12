import * as ImplDbConnKv from './impl-db-conn-kv'
import * as ImplStream from './impl-stream'
import type { ISpacesCoreBackend } from './interface'

export type Config = ImplDbConnKv.Config | ImplStream.Config

export const SpacesCoreBackend = async (config: Config): Promise<ISpacesCoreBackend> => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.SpacesCoreBackend(config)
    }
    case 'stream': {
      return ImplStream.SpacesCoreBackend(config)
    }
  }
}
