import * as ImplAlwaysErr from './impl-always-err'
import * as ImplHashMap from './impl-hash-map'
import * as ImplSqlDb from './impl-sql-db'
import type { IVerificationDb } from './interface'

export type Config = ImplHashMap.Config | ImplSqlDb.Config | ImplAlwaysErr.Config

export const VerificationDb = (config: Config): IVerificationDb => {
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.VerificationDb(config)
    }
    case 'sql-db': {
      return ImplSqlDb.VerificationDb(config)
    }
    case 'always-err': {
      return ImplAlwaysErr.VerificationDb(config)
    }
  }
}
