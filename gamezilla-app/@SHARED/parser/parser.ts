import { Result } from "../core"

export type ParserError = {
  message: string
}

export type Parser<T> = {
  parse: (input: unknown) => Result<ParserError, T>
}

export type ParserObject = <T>(parsers: {
  [K in keyof T]: Parser<T[K]>
}) => Parser<T>

export type ParserString = Parser<string>

export type ParserNumber = Parser<number>

export type ParserLiteral = <T extends string | number | boolean>(
  value: T,
) => Parser<T>

export type ParserArray = <T>(parser: Parser<T>) => Parser<T[]>

export type ParserNullish = <T>(
  parser: Parser<T>,
) => Parser<T | null | undefined>

export type ParserCustom = <T>(
  predicate: (input: unknown) => input is T,
) => Parser<T>

export type ParserTaggedUnion = <
  TTagName extends string,
  U extends { [K in TTagName]: string },
>(
  tag: TTagName,
  parsers: Array<Parser<U>>,
) => Parser<U>

export type P = {
  obj: ParserObject
  str: ParserString
  num: ParserNumber
  l: ParserLiteral
  arr: ParserArray
  maybe: ParserNullish
  custom: ParserCustom
}

export type Infer<TParser> = TParser extends Parser<infer T> ? T : never
