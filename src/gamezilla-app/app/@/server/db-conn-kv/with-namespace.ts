import { type Task } from 'gamezilla-app/@/core'
import type { Parser } from 'gamezilla-app/@/core/parser/parser'
import { IDbConnKv } from './interface'

export const withNamespace = <TKey extends string = string, TValue = unknown>(
  dbConnKv: IDbConnKv,
  namespace: string[],
  parser: Parser<TValue>
): {
  get: (key: TKey) => Task<string, TValue | null>
  getMany: (keys: TKey[]) => Task<string, TValue[]>
  set: (key: TKey, value: TValue) => Task<string, null>
  setMany: (entries: [TKey, TValue][]) => Task<string, null>
  zap: (key: TKey) => Task<string, null>
} => {
  const toKey = (key: string) => [...namespace, key].join(':')
  return {
    get(key) {
      return dbConnKv.get(toKey(key), parser)
    },
    getMany(keys) {
      const namespacedKeys = keys.map(toKey)
      return dbConnKv.getMany(namespacedKeys, parser)
    },
    set(key, value) {
      return dbConnKv.set(toKey(key), value)
    },
    setMany(entries) {
      const namespacedEntries = entries.map(([key, value]): [string, TValue] => [toKey(key), value])
      return dbConnKv.setMany(namespacedEntries)
    },
    zap(key) {
      return dbConnKv.zap(toKey(key))
    }
  }
}
