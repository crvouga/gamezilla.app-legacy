import { ImplHashMap } from './impl-hash-map'
import type { IKeyValueDb } from './interface'

export type ImplInMemory = Omit<ImplHashMap, 't'> & {
  t: 'in-memory'
}

const init = (config: ImplInMemory): IKeyValueDb => {
  return ImplHashMap.init({ ...config, t: 'hash-map' })
}

export const ImplInMemory = {
  init,
}
