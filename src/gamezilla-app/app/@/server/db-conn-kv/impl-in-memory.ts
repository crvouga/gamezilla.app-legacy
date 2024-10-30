import type { IDbConnKv } from './interface'
import * as ImplHashMap from './impl-hash-map'

export type Config = Omit<ImplHashMap.Config, 't'> & {
  t: 'in-memory'
}

export const DbConnKv = (config: Config): IDbConnKv => {
  return ImplHashMap.DbConnKv({ ...config, t: 'hash-map' })
}
