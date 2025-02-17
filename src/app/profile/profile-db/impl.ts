import * as ImplDbConnSql from './impl-db-conn-sql'
import * as ImplHashMap from './impl-hash-map'
import type { IProfileDb } from './interface'

export type Config = ImplHashMap.Config | ImplDbConnSql.Config

export const ProfileDb = (config: Config): IProfileDb => {
  switch (config.t) {
    case 'hash-map':
      return ImplHashMap.ProfileDb(config)
    case 'db-conn-sql':
      return ImplDbConnSql.ProfileDb(config)
  }
}
