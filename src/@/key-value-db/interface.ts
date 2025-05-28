import type { Task } from '~/@/promise/task'
import type { Parser } from '~/@/schema/schema'

export type IKeyValueDb = {
  get: <TValue>(key: string, schema: Parser<TValue>) => Task<string, TValue | null>
  getMany: <TValue>(keys: string[], schema: Parser<TValue>) => Task<string, TValue[]>
  set: <TValue>(key: string, value: TValue) => Task<string, null>
  setMany: <TValue>(entries: [string, TValue][]) => Task<string, null>
  zap: (key: string) => Task<string, null>
}
