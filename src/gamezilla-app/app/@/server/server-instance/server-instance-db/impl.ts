import * as ImplDbConnKv from './impl-db-conn-kv'
import { IServerInstanceDb } from './interface'

export type Config = ImplDbConnKv.Config

export const ServerInstanceDb = (config: Config): IServerInstanceDb => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.ServerInstanceDb(config)
    }
  }
}
