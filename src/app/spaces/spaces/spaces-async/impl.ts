import * as ImplKeyValueDb from './impl-key-value-db'
import * as ImplStream from './impl-stream'
import type { ISpacesAsync } from './interface'

export type Config = ImplKeyValueDb.Config | ImplStream.Config

export const SpacesCoreAsync = async (config: Config): Promise<ISpacesAsync> => {
  switch (config.t) {
    case 'key-value-db': {
      return ImplKeyValueDb.SpacesCoreAsync(config)
    }
    case 'stream': {
      return ImplStream.SpacesCoreAsync(config)
    }
  }
}
