import * as ImplDbConnKv from './impl-db-conn-kv'
import * as ImplStream from './impl-stream'
import type { ISpacesCoreAsync } from './interface'

export type Config = ImplDbConnKv.Config | ImplStream.Config

export const SpacesCoreAsync = async (config: Config): Promise<ISpacesCoreAsync> => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.SpacesCoreAsync(config)
    }
    case 'stream': {
      return ImplStream.SpacesCoreAsync(config)
    }
  }
}
