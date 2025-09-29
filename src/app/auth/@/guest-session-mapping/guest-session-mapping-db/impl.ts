import * as ImplHashMap from './impl-hash-map'
import * as ImplSql from './impl-sql'
import { IGuestSessionMappingDb } from './interface'

export type Config = ImplHashMap.Config | ImplSql.Config

export const GuestSessionMappingDb = (config: Config): IGuestSessionMappingDb => {
  switch (config.t) {
    case 'hash-map':
      return ImplHashMap.GuestSessionMappingDb(config)
    case 'sql':
      return ImplSql.GuestSessionMappingDb(config)
  }
}
