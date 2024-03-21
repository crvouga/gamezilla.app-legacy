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

export const errorToString = (error: ParserError): string => {
  return error.path.join(".") + ": " + error.message
}

export const errorsToString = (errors: ParserError[]): string => {
  return errors.map(errorToString).join("\n")
}

export type Parser<T> = {
  parse: (input: unknown) => Result<ParserError[], T>
}

export type Infer<TParser> = TParser extends Parser<infer T> ? T : never

export const is =
  <T>(parser: Parser<T>) =>
  (input: unknown): input is T => {
    return parser.parse(input).t === "ok"
  }

//
//
//
//
//
//

const toErrorMessage = (
  expected: string,
  actual: string,
  actualValue: string,
) => {
  return `Expected: ${expected}.\nActual Type: ${actual}.\nActual Value: ${actualValue}\n`
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
            message: toErrorMessage(
              "object",
              typeof input,
              JSON.stringify(input),
            ),
            path: [],
          },
        ])
      }

      if (input === null) {
        return Result.err([
          {
            message: toErrorMessage("object", "null", JSON.stringify(input)),
            path: [],
          },
        ])
      }

      if (!isIndexable(input)) {
        return Result.err([
          {
            message: toErrorMessage(
              "object",
              "non-indexable",
              JSON.stringify(input),
            ),
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
          message: toErrorMessage(
            "string",
            typeof input,
            `${input instanceof Date}, ${JSON.stringify(input)}`,
          ),
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
          message: toErrorMessage(
            "number",
            typeof input,
            JSON.stringify(input),
          ),
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
            message: toErrorMessage(
              String(value),
              String(input),
              JSON.stringify(input),
            ),
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
            message: toErrorMessage(
              "array",
              typeof input,
              JSON.stringify(input),
            ),
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

export const dict = <TKey extends string | number, TValue>(
  key: Parser<TKey>,
  value: Parser<TValue>,
): Parser<Record<TKey, TValue>> => {
  return {
    parse(input) {
      if (!isIndexable(input)) {
        return Result.err([
          {
            message: toErrorMessage(
              "object",
              typeof input,
              JSON.stringify(input),
            ),
            path: [],
          },
        ])
      }

      const result = {} as Record<TKey, TValue>
      const errors: ParserError[] = []
      for (const k in input) {
        const keyParsed = key.parse(k)
        if (keyParsed.t === "err") {
          errors.push(
            ...keyParsed.error.map((err): ParserError => {
              return {
                message: err.message,
                path: [k, ...err.path],
              }
            }),
          )
          continue
        }

        const valueParsed = value.parse(input[k])
        if (valueParsed.t === "err") {
          errors.push(
            ...valueParsed.error.map((err): ParserError => {
              return {
                message: err.message,
                path: [k, ...err.path],
              }
            }),
          )
          continue
        }

        result[keyParsed.value] = valueParsed.value
      }

      if (errors.length > 0) {
        return Result.err(errors)
      }

      return Result.ok(result)
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

export const unknown: Parser<unknown> = {
  parse(input) {
    return Result.ok(input)
  },
}

export const any: Parser<any> = {
  parse(input) {
    return Result.ok(input)
  },
}

export const enumeration = <T extends string | number>(
  values: T[] | readonly T[],
): Parser<T> => {
  return {
    parse(input) {
      if (!values.includes(input as T)) {
        return Result.err([
          {
            message: toErrorMessage(
              `one of ${values.join(", ")}`,
              String(input),
              JSON.stringify(input),
            ),
            path: [],
          },
        ])
      }
      return Result.ok(input as T)
    },
  }
}

export { or } from "./or"
