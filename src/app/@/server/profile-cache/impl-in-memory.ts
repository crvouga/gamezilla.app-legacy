import { DbConnKv } from 'app/@/server/db-conn-kv'
import * as ImplDbConnKv from './impl-db-conn-kv'
import type { IProfileCache } from './interface'

export type Config = {
  t: 'in-memory'
}

export const ProfileCache = async (_config: Config): Promise<IProfileCache> => {
  return ImplDbConnKv.ProfileCache({
    t: 'db-conn-kv',
    dbConnKv: await DbConnKv({ t: 'hash-map' })
  })
}
