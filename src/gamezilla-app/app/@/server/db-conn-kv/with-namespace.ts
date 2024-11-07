import { Task } from '@/core'
import type { Parser } from '@/core/parser/parser'
import { IDbConnKv } from './interface'

export const withNamespace = <TKey extends string = string, TValue = unknown>(config: {
  dbConnKv: IDbConnKv
  namespace: string[]
  parser: Parser<TValue>
}): {
  get: (key: TKey) => Task<string, TValue | null>
  getMany: (keys: TKey[]) => Task<string, TValue[]>
  setMany: (entries: [TKey, TValue][]) => Task<string, null>
  zap: (key: TKey) => Task<string, null>
  set: (key: TKey, value: TValue) => Task<string, null>
} => {
  const toKey = (key: string) => [...config.namespace, key].join(':')
  return {
    get(key) {
      return config.dbConnKv.get(toKey(key), config.parser)
    },
    getMany(keys) {
      const namespacedKeys = keys.map(toKey)
      return config.dbConnKv.getMany(namespacedKeys, config.parser)
    },
    set(key, value) {
      return config.dbConnKv.set(toKey(key), value)
    },
    setMany(entries) {
      const namespacedEntries = entries.map(([key, value]): [string, TValue] => [toKey(key), value])
      return config.dbConnKv.setMany(namespacedEntries)
    },
    zap(key) {
      return config.dbConnKv.zap(toKey(key))
    }
  }
}
