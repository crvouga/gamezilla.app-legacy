import type { Schema } from '~/@/schema/schema'
import { Result } from '../result'

export type IKeyValueDbSync = {
  get: <TValue>(key: string, schema: Schema<TValue>) => Result<string, TValue | null>
  set: <TValue>(key: string, value: TValue) => Result<string, null>
  zap: (key: string) => Result<string, null>
}
