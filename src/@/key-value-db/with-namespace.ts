import { Task } from '~/@/promise/task'
import type { Schema } from '~/@/schema/schema'
import { IKeyValueDb } from './interface'

export const withNamespace = <TKey extends string = string, TValue = unknown>(config: {
  keyValueDb: IKeyValueDb
  namespace: string[]
  schema: Schema<TValue>
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
      return config.keyValueDb.get(toKey(key), config.schema)
    },
    getMany(keys) {
      const namespacedKeys = keys.map(toKey)
      return config.keyValueDb.getMany(namespacedKeys, config.schema)
    },
    set(key, value) {
      return config.keyValueDb.set(toKey(key), value)
    },
    setMany(entries) {
      const namespacedEntries = entries.map(([key, value]): [string, TValue] => [toKey(key), value])
      return config.keyValueDb.setMany(namespacedEntries)
    },
    zap(key) {
      return config.keyValueDb.zap(toKey(key))
    },
  }
}
