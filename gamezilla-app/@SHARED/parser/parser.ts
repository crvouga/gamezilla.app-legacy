import { Result } from "../core"

//
//
//
//
//

export type ParserError = {
  message: string
  path: string[]
}

export type Parser<T> = {
  parse: (input: unknown) => Result<ParserError[], T>
}

export type Infer<TParser> = TParser extends Parser<infer T> ? T : never

//
//
//
//
//
//

const toErrorMessage = (expected: string, actual: string) => {
  return `Expected: ${expected}. Actual: ${actual}`
}

const isIndexable = (input: unknown): input is Record<string, unknown> => {
  return typeof input === "object" && input !== null
}

export const obj = <T>(parsers: {
  [K in keyof T]: Parser<T[K]>
}): Parser<T> => {
  return {
    parse(input) {
      if (typeof input !== "object") {
        return Result.err([
          {
            message: toErrorMessage("object", typeof input),
            path: [],
          },
        ])
      }

      if (input === null) {
        return Result.err([
          {
            message: toErrorMessage("object", "null"),
            path: [],
          },
        ])
      }

      if (!isIndexable(input)) {
        return Result.err([
          {
            message: toErrorMessage("object", "non-indexable"),
            path: [],
          },
        ])
      }

      const result: Partial<T> = {}
      const errors: ParserError[] = []
      for (const key in parsers) {
        const parser = parsers[key]

        const value = input[key]

        const parsed = parser.parse(value)

        if (parsed.t === "ok") {
          result[key] = parsed.value
          continue
        }

        errors.push(
          ...parsed.error.map((err): ParserError => {
            return {
              message: err.message,
              path: [key, ...err.path],
            }
          }),
        )
      }

      if (errors.length > 0) {
        return Result.err(errors)
      }

      return Result.ok(result as T)
    },
  }
}

export const str: Parser<string> = {
  parse(input) {
    if (typeof input !== "string") {
      return Result.err([
        {
          message: toErrorMessage("string", typeof input),
          path: [],
        },
      ])
    }
    return Result.ok(input)
  },
}

export const num: Parser<number> = {
  parse(input) {
    if (typeof input !== "number") {
      return Result.err([
        {
          message: toErrorMessage("number", typeof input),
          path: [],
        },
      ])
    }
    return Result.ok(input)
  },
}

export const l = <T extends string | number | boolean | null | undefined>(
  value: T,
): Parser<T> => {
  return {
    parse(input) {
      if (input !== value) {
        return Result.err([
          {
            message: toErrorMessage(String(value), String(input)),
            path: [],
          },
        ])
      }
      return Result.ok(value)
    },
  }
}

export const arr = <T>(parser: Parser<T>): Parser<T[]> => {
  return {
    parse(input) {
      if (!Array.isArray(input)) {
        return Result.err([
          {
            message: toErrorMessage("array", typeof input),
            path: [],
          },
        ])
      }

      const result: T[] = []
      const errors: ParserError[] = []
      for (let i = 0; i < input.length; i++) {
        const value = input[i]
        const parsed = parser.parse(value)
        if (parsed.t === "ok") {
          result.push(parsed.value)
          continue
        }
        errors.push(
          ...parsed.error.map((err): ParserError => {
            return {
              message: err.message,
              path: [String(i), ...err.path],
            }
          }),
        )
      }

      if (errors.length > 0) {
        return Result.err(errors)
      }

      return Result.ok(result)
    },
  }
}

export const maybe = <T>(parser: Parser<T>): Parser<T | null | undefined> => {
  return {
    parse(input) {
      if (input === null || input === undefined) {
        return Result.ok(null)
      }
      return parser.parse(input)
    },
  }
}

export const custom = <T>(
  predicate: (input: unknown) => input is T,
  errorMessage: string,
): Parser<T> => {
  return {
    parse(input) {
      if (predicate(input)) {
        return Result.ok(input)
      }
      return Result.err([
        {
          message: `Custom validation failed. ${errorMessage}`,
          path: [],
        },
      ])
    },
  }
}

export { or } from "./or"
