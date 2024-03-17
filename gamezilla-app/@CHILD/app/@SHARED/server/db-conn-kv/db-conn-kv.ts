import { Task } from "gamezilla-app/@SHARED/core"

export type DbConnKv = {
  get: <TValue>(
    key: string,
    isValue: (row: unknown) => row is TValue,
  ) => Task<string, TValue | null>
  set: <TValue>(key: string, value: TValue) => Task<string, null>
  zap: (key: string) => Task<string, null>
}

const instance = <TValue>(
  dbConnKv: DbConnKv,
  namespace: string[],
  isValue: (row: unknown) => row is TValue,
): {
  get: (key: string) => Task<string, TValue | null>
  set: (key: string, value: TValue) => Task<string, null>
  zap: (key: string) => Task<string, null>
} => {
  const toKey = (key: string) => [...namespace, key].join(":")
  return {
    get: (key: string) => {
      return dbConnKv.get(toKey(key), isValue)
    },
    set: (key: string, value: TValue) => {
      return dbConnKv.set(toKey(key), value)
    },
    zap: (key: string) => {
      return dbConnKv.zap(toKey(key))
    },
  }
}

export const DbConnKv = {
  instance,
}
