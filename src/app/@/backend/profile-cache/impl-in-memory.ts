import { KeyValueDb } from '~/@/key-value-db'
import * as ImplKeyValueDb from './impl-key-value-db'
import type { IProfileCache } from './interface'

export type Config = {
  t: 'in-memory'
}

export const ProfileCache = async (_config: Config): Promise<IProfileCache> => {
  return ImplKeyValueDb.ProfileCache({
    t: 'key-value-db',
    keyValueDb: await KeyValueDb({ t: 'hash-map' }),
  })
}
