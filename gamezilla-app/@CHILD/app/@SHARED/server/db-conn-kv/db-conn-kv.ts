import { Task } from "gamezilla-app/@SHARED/core"

export type DbConnKv = {
  get: <TValue>(
    isValue: (row: unknown) => row is TValue,
    key: string,
  ) => Task<string, TValue | null>
  set: <TValue>(key: string, value: TValue) => Task<string, null>
  zap: (key: string) => Task<string, null>
}
