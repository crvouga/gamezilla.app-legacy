import type { ResultInternal } from '../../result/result'
import { ParseError } from './parse-error'

export type Schema<T> = {
  parse: (input: unknown) => ResultInternal<ParseError, T>
}

export const isSchema = <T>(input: unknown): input is Schema<T> => {
  return typeof input === 'object' && input !== null && 'parse' in input
}

export type Infer<TParser> = TParser extends Schema<infer T> ? T : never
