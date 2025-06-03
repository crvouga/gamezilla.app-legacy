import * as ImplKeyValueDb from './impl-key-value-db'
import * as ImplStream from './impl-stream'
import type { ISpacesDb } from './interface'

export type Config = ImplKeyValueDb.Config | ImplStream.Config

export const SpacesDb = async (config: Config): Promise<ISpacesDb> => {
  switch (config.t) {
    case 'key-value-db': {
      return ImplKeyValueDb.SpacesDb(config)
    }
    case 'stream': {
      return ImplStream.SpacesDb(config)
    }
  }
}
