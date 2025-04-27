import type { ResultInternal } from '../../result/result'

export type ParserError = {
  message: string
  path: string[]
}

export type Parser<T> = {
  parse: (input: unknown) => ResultInternal<ParserError[], T>
}

export const isParser = <T>(input: unknown): input is Parser<T> => {
  return typeof input === 'object' && input !== null && 'parse' in input
}

export type Infer<TParser> = TParser extends Parser<infer T> ? T : never
