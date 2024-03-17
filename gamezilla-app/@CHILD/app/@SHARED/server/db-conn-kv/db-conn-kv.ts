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
  namespace: string,
  isValue: (row: unknown) => row is TValue,
): {
  get: (key: string) => Task<string, TValue | null>
  set: (key: string, value: TValue) => Task<string, null>
  zap: (key: string) => Task<string, null>
} => {
  return {
    get: (key: string) => {
      return dbConnKv.get(`${namespace}:${key}`, isValue)
    },
    set: (key: string, value: TValue) => {
      return dbConnKv.set(`${namespace}:${key}`, value)
    },
    zap: (key: string) => {
      return dbConnKv.zap(`${namespace}:${key}`)
    },
  }
}

export const DbConnKv = {
  instance,
}
