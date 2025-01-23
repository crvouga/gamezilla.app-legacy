import * as CachedKeyValueDb from './impl-cached-db-conn-kv'
import * as ImplKeyValueDb from './impl-db-conn-kv'
import * as ImplInMemory from './impl-in-memory'
import type { IProfileCache } from './interface'

export type Config = ImplInMemory.Config | ImplKeyValueDb.Config | CachedKeyValueDb.Config

export const ProfileCache = async (config: Config): Promise<IProfileCache> => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplKeyValueDb.ProfileCache(config)
    }
    case 'in-memory': {
      return ImplInMemory.ProfileCache(config)
    }
    case 'cached-db-conn-kv': {
      return CachedKeyValueDb.ProfileCache(config)
    }
  }
}
