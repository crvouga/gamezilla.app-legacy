import type { ResultInternal } from '../../core/result'

export type ParserError = {
  message: string
  path: string[]
}

export type Parser<T> = {
  parse: (input: unknown) => ResultInternal<ParserError[], T>
}

export type Infer<TParser> = TParser extends Parser<infer T> ? T : never
