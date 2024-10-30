import type { IDbConnKv } from './interface'
import * as ImplHashMap from './impl-hash-map'

export type Config = {
  t: 'in-memory'
}

export const DbConnKv = (_config: Config): IDbConnKv => {
  return ImplHashMap.DbConnKv()
}
