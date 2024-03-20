import { Result } from "../core"

export type ParserError = {
  message: string
}

export type Parser<T> = {
  parse: (input: unknown) => Result<ParserError, T>
}

export type Parsers = {
  object: <T>(parsers: { [K in keyof T]: Parser<T[K]> }) => Parser<T>
  string: Parser<string>
  number: Parser<number>
  literal: <T extends string | number | boolean>(value: T) => Parser<T>
  array: <T>(parser: Parser<T>) => Parser<T[]>
  nullish: <T>(parser: Parser<T>) => Parser<T | null | undefined>
  custom: <T>(predicate: (input: unknown) => input is T) => Parser<T>
  discriminatedUnion: <T extends string, U>(
    tag: T,
    parsersArray: Array<Parser<U & { t: T }>>,
  ) => Parser<U>
}
