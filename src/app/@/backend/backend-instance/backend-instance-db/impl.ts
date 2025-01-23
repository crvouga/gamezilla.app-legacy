import * as ImplKeyValueDb from './impl-db-conn-kv'
import { IBackendInstanceDb } from './interface'

export type Config = ImplKeyValueDb.Config

export const BackendInstanceDb = (config: Config): IBackendInstanceDb => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplKeyValueDb.BackendInstanceDb(config)
    }
  }
}
