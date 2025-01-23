import type { IKeyValueDb } from './interface'
import * as ImplHashMap from './impl-hash-map'

export type Config = Omit<ImplHashMap.Config, 't'> & {
  t: 'in-memory'
}

export const KeyValueDb = (config: Config): IKeyValueDb => {
  return ImplHashMap.KeyValueDb({ ...config, t: 'hash-map' })
}
