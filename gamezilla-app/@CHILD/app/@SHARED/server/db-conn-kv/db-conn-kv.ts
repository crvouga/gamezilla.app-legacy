import { Task } from "gamezilla-app/@SHARED/core"
import { Parser } from "gamezilla-app/@SHARED/core/parser/parser"

export type IDbConnKv = {
  get: <TValue>(
    key: string,
    parser: Parser<TValue>,
  ) => Task<string, TValue | null>
  set: <TValue>(key: string, value: TValue) => Task<string, null>
  setMany: <TValue>(entries: [string, TValue][]) => Task<string, null>
  zap: (key: string) => Task<string, null>
}

const instance = <TKey extends string = string, TValue = unknown>(
  dbConnKv: IDbConnKv,
  namespace: string[],
  parser: Parser<TValue>,
): {
  get: (key: TKey) => Task<string, TValue | null>
  set: (key: TKey, value: TValue) => Task<string, null>
  setMany: (entries: [TKey, TValue][]) => Task<string, null>
  zap: (key: TKey) => Task<string, null>
} => {
  const toKey = (key: string) => [...namespace, key].join(":")
  return {
    get(key) {
      return dbConnKv.get(toKey(key), parser)
    },
    set(key, value) {
      return dbConnKv.set(toKey(key), value)
    },
    setMany(entries) {
      const namespacedEntries = entries.map(
        ([key, value]): [string, TValue] => [toKey(key), value],
      )
      return dbConnKv.setMany(namespacedEntries)
    },
    zap(key) {
      return dbConnKv.zap(toKey(key))
    },
  }
}

export const IDbConnKv = {
  instance,
}
