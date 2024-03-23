import { ResultPrivate } from "./result"
import { parser } from "./result-parser"
export * from "./result"
export type { ResultPrivate } from "./result"

export type Result<TError, TValue> = ResultPrivate<TError, TValue>

export const Result = {
  ...parser,
  ...ResultPrivate,
}
