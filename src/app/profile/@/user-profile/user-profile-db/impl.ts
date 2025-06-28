import * as ImplHashMap from './impl-hash-map'
import * as ImplSql from './impl-sql'
import type { IUserProfileDb } from './interface'

export type Config = ImplHashMap.Config | ImplSql.Config

export const ProfileDb = (config: Config): IUserProfileDb => {
  switch (config.t) {
    case 'hash-map':
      return ImplHashMap.ProfileDb(config)
    case 'sql':
      return ImplSql.ProfileDb(config)
  }
}
