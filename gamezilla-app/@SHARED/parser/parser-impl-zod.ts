import { z } from "zod"
import { Parser, ParserError, Parsers } from "./parser"
import { Result } from "../core"

const toResult = <T>(schema: z.ZodSchema<T>): Parser<T> => {
  return {
    parse: (input: unknown): Result<ParserError, T> => {
      try {
        const result = schema.parse(input)
        return Result.ok(result)
      } catch (error) {
        return Result.err({
          message: error instanceof Error ? error.message : "Unknown error",
        })
      }
    },
  }
}

export const p: Parsers = {
  object: <T>(parsers: { [K in keyof T]: Parser<T[K]> }): Parser<T> => {
    const schema = z.object(
      Object.keys(parsers).reduce((acc, key) => {
        // @ts-ignore
        acc[key] = parsers[key].parse
        return acc
      }, {} as any),
    )
    // @ts-ignore
    return toResult(schema)
  },
  string: toResult(z.string()),
  number: toResult(z.number()),
  literal: <T extends string | number | boolean>(value: T): Parser<T> =>
    toResult(z.literal(value)),
  array: <T>(parser: Parser<T>): Parser<T[]> =>
    // @ts-ignore
    toResult(z.array(parser.parse)),
  nullish: <T>(parser: Parser<T>): Parser<T | null> =>
    // @ts-ignore
    toResult(parser.nullish()),
  custom: <T>(predicate: (input: unknown) => input is T): Parser<T> => ({
    parse: (input: unknown): Result<ParserError, T> => {
      if (predicate(input)) {
        // @ts-ignore
        return { success: true, value: input }
      } else {
        return {
          // @ts-ignore
          success: false,
          error: { message: "Custom validation failed" },
        }
      }
    },
  }),
  discriminatedUnion: <T extends string, U>(
    tag: T,
    parsersArray: Array<Parser<U & { t: T }>>,
  ): Parser<U> => {
    const schema = z.discriminatedUnion(
      tag,
      // @ts-ignore
      parsersArray.map((p) => p.parse()),
    )
    // @ts-ignore
    return toResult(schema)
  },
}
