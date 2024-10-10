import { DbConnKv, type IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { ProfileCacheDbKv } from './impl-db-conn-kv'
import type { IProfileCache } from './interface'

export type Config = { t: 'db-conn-kv'; dbConnKv: IDbConnKv } | { t: 'in-memory' }

export const ProfileCache = async (config: Config): Promise<IProfileCache> => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ProfileCacheDbKv(config)
    }
    case 'in-memory': {
      return ProfileCacheDbKv({ ...config, dbConnKv: await DbConnKv({ t: 'in-memory' }) })
    }
  }
}
