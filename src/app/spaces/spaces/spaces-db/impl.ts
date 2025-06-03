import * as ImplKeyValueDb from './impl-key-value-db'
import type { ISpacesDb } from './interface'

export type Config = ImplKeyValueDb.Config

export const SpacesDb = async (config: Config): Promise<ISpacesDb> => {
  switch (config.t) {
    case 'key-value-db': {
      return ImplKeyValueDb.SpacesDb(config)
    }
  }
}
