import { z } from "zod"
import { Parser, ParserError, P } from "./parser"
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

export const p: P = {
  obj: <T>(parsers: { [K in keyof T]: Parser<T[K]> }): Parser<T> => {
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
  str: toResult(z.string()),
  num: toResult(z.number()),
  l: <T extends string | number | boolean>(value: T): Parser<T> =>
    toResult(z.literal(value)),
  arr: <T>(parser: Parser<T>): Parser<T[]> =>
    // @ts-ignore
    toResult(z.array(parser.parse)),
  nil: <T>(parser: Parser<T>): Parser<T | null> =>
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
}
