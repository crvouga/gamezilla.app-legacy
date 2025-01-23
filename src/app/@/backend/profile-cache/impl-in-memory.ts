import { KeyValueDb } from '~/@/db-conn-kv'
import * as ImplKeyValueDb from './impl-db-conn-kv'
import type { IProfileCache } from './interface'

export type Config = {
  t: 'in-memory'
}

export const ProfileCache = async (_config: Config): Promise<IProfileCache> => {
  return ImplKeyValueDb.ProfileCache({
    t: 'db-conn-kv',
    keyValueDb: await KeyValueDb({ t: 'hash-map' }),
  })
}
