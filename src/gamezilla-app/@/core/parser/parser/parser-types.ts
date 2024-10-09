import type { ResultInternal } from '../../result/result'

export type ParserError = {
  message: string
  path: string[]
}

export type Parser<T> = {
  parse: (input: unknown) => ResultInternal<ParserError[], T>
  // WIP
  encode?: (input: T) => string
  decode?: (input: string) => T | null
}

export type Infer<TParser> = TParser extends Parser<infer T> ? T : never
