import * as ImplHashMap from './impl-hash-map'
import * as ImplPostgres from './impl-postgres'
import { IGuestSessionMappingDb } from './interface'

export type Config = ImplHashMap.Config | ImplPostgres.Config

export const GuestSessionMappingDb = (config: Config): IGuestSessionMappingDb => {
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.GuestSessionMappingDb(config)
    }

    case 'postgres': {
      return ImplPostgres.GuestSessionMappingDb(config)
    }
  }
}
