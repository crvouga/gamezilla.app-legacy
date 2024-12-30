import type { Task } from '~/@/promise/task'
import type { Parser } from '~/@/core/parser/parser'

export type IDbConnKv = {
  get: <TValue>(key: string, parser: Parser<TValue>) => Task<string, TValue | null>
  getMany: <TValue>(keys: string[], parser: Parser<TValue>) => Task<string, TValue[]>
  set: <TValue>(key: string, value: TValue) => Task<string, null>
  setMany: <TValue>(entries: [string, TValue][]) => Task<string, null>
  zap: (key: string) => Task<string, null>
}
