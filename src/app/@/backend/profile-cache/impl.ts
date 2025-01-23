import * as CachedKeyValueDb from './impl-cached-key-value-db'
import * as ImplKeyValueDb from './impl-key-value-db'
import * as ImplInMemory from './impl-in-memory'
import type { IProfileCache } from './interface'

export type Config = ImplInMemory.Config | ImplKeyValueDb.Config | CachedKeyValueDb.Config

export const ProfileCache = async (config: Config): Promise<IProfileCache> => {
  switch (config.t) {
    case 'key-value-db': {
      return ImplKeyValueDb.ProfileCache(config)
    }
    case 'in-memory': {
      return ImplInMemory.ProfileCache(config)
    }
    case 'cached-key-value-db': {
      return CachedKeyValueDb.ProfileCache(config)
    }
  }
}
