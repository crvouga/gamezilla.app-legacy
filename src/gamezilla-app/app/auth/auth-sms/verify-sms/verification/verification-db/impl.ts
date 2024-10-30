import * as ImplAlwaysErr from './impl-always-err'
import * as ImplHashMap from './impl-hash-map'
import * as ImplPostgres from './impl-postgres'
import type { IVerificationDb } from './interface'

export type Config = ImplHashMap.Config | ImplPostgres.Config | ImplAlwaysErr.Config

export const VerificationDb = (config: Config): IVerificationDb => {
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.VerificationDb(config)
    }
    case 'postgres': {
      return ImplPostgres.VerificationDb(config)
    }
    case 'always-err': {
      return ImplAlwaysErr.VerificationDb(config)
    }
  }
}
