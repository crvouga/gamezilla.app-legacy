import * as ImplKeyValueDb from './impl-key-value-db'
import { IBackendInstanceDb } from './interface'

export type Config = ImplKeyValueDb.Config

export const BackendInstanceDb = (config: Config): IBackendInstanceDb => {
  switch (config.t) {
    case 'key-value-db': {
      return ImplKeyValueDb.BackendInstanceDb(config)
    }
  }
}
