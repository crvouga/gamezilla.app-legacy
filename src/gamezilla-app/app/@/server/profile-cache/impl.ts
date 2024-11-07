import * as CachedDbConnKv from './impl-cached-db-conn-kv'
import * as ImplDbConnKv from './impl-db-conn-kv'
import * as ImplInMemory from './impl-in-memory'
import type { IProfileCache } from './interface'

export type Config = ImplInMemory.Config | ImplDbConnKv.Config | CachedDbConnKv.Config

export const ProfileCache = async (config: Config): Promise<IProfileCache> => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.ProfileCache(config)
    }
    case 'in-memory': {
      return ImplInMemory.ProfileCache(config)
    }
    case 'cached-db-conn-kv': {
      return CachedDbConnKv.ProfileCache(config)
    }
  }
}
