import type { ResultInternal } from '../../result/result'

export type ParserError = {
  message: string
  path: string[]
}

export type Schema<T> = {
  parse: (input: unknown) => ResultInternal<ParserError[], T>
}

export const isSchema = <T>(input: unknown): input is Schema<T> => {
  return typeof input === 'object' && input !== null && 'parse' in input
}

export type Infer<TParser> = TParser extends Schema<infer T> ? T : never
