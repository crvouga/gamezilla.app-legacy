import type { IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { ProfileCacheDbKv } from './impl-db-conn-kv'
import type { IProfileCache } from './interface'

export type Impl = { t: 'db-conn-kv'; dbConnKv: IDbConnKv }

export const ProfileCache = (config: Impl): IProfileCache => {
  switch (config.t) {
    case 'db-conn-kv':
      return ProfileCacheDbKv(config)
  }
}
