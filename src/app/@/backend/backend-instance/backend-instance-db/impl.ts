import * as ImplDbConnKv from './impl-db-conn-kv'
import { IBackendInstanceDb } from './interface'

export type Config = ImplDbConnKv.Config

export const BackendInstanceDb = (config: Config): IBackendInstanceDb => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.BackendInstanceDb(config)
    }
  }
}
