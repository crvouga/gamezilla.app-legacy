import * as ImplDbConnKv from './impl-db-conn-kv'
import * as ImplStream from './impl-stream'
import type { ISpaceBackend } from './interface'

export type Config = ImplDbConnKv.Config | ImplStream.Config

export const SpaceBackend = async (config: Config): Promise<ISpaceBackend> => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.SpaceBackend(config)
    }
    case 'stream': {
      return ImplStream.SpaceBackend(config)
    }
  }
}
