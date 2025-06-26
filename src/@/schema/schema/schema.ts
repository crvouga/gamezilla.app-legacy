import type { Brand } from '../../brand/brand'
import { Err, Ok } from '../../result/result'
import { ParseErrorEntry } from './parse-error-entry'
import type { Schema } from './schema-types'

const toErrorMessage = (expected: string, actual: string, actualValue: string) => {
  return `Expected: ${expected}.\nActual Type: ${actual}.\nActual Value: ${actualValue}\n`
}

const safeJsonStringify = (input: unknown): string => {
  try {
    return JSON.stringify(input)
  } catch (error) {
    return String(input)
  }
}

export const is =
  <T>(schema: Schema<T>) =>
  (input: unknown): input is T => {
    return schema.parse(input).t === 'ok'
  }

export const noop = <T>(): Schema<T> => {
  return {
    parse(input) {
      return Ok(input as T)
    },
  }
}

const isIndexable = (input: unknown): input is Record<string, unknown> => {
  return typeof input === 'object' && input !== null
}

export const obj = <T>(schemas: {
  [K in keyof T]: Schema<T[K]>
}): Schema<T> => {
  return {
    parse(input) {
      if (typeof input !== 'object') {
        return Err({
          entries: [
            {
              message: toErrorMessage('object', typeof input, safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }

      if (input === null) {
        return Err({
          entries: [
            {
              message: toErrorMessage('object', 'null', safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }

      if (!isIndexable(input)) {
        return Err({
          entries: [
            {
              message: toErrorMessage('object', 'non-indexable', safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }

      const result: Partial<T> = {}
      const errors: ParseErrorEntry[] = []
      for (const key in schemas) {
        const schema = schemas[key]
        const value = input[key]
        const parsed = schema.parse(value)

        if (parsed.t === 'ok') {
          result[key] = parsed.value
          continue
        }

        errors.push(
          ...parsed.error.entries.map((err): ParseErrorEntry => {
            return {
              message: err.message,
              path: [key, ...err.path],
            }
          }),
        )
      }

      if (errors.length > 0) {
        return Err({ entries: errors })
      }

      return Ok(result as T)
    },
  }
}

export const partialObj = <T>(schemas: {
  [K in keyof T]: Schema<T[K]>
}): Schema<Partial<T>> => {
  return {
    parse(input) {
      if (typeof input !== 'object' || input === null) {
        return Err({
          entries: [
            {
              message: 'Expected object',
              path: [],
            },
          ],
        })
      }

      const objInput = input as Record<string, unknown>
      const result: Partial<T> = {}
      const errors: ParseErrorEntry[] = []

      for (const key in schemas) {
        if (key in objInput) {
          const parsed = schemas[key].parse(objInput[key])
          if (parsed.t === 'ok') {
            result[key] = parsed.value
          } else {
            errors.push(
              ...parsed.error.entries.map((err) => ({
                ...err,
                path: [key, ...err.path],
              })),
            )
          }
        }
      }

      return errors.length > 0 ? Err({ entries: errors }) : Ok(result)
    },
  }
}

export const str = (): Schema<string> => {
  return {
    parse(input) {
      if (typeof input !== 'string') {
        return Err({
          entries: [
            {
              message: toErrorMessage('string', typeof input, `${input instanceof Date}, ${safeJsonStringify(input)}`),
              path: [],
            },
          ],
        })
      }
      return Ok(input)
    },
  }
}

export const num = (): Schema<number> => {
  return {
    parse(input) {
      if (typeof input !== 'number') {
        return Err({
          entries: [
            {
              message: toErrorMessage('number', typeof input, safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }
      return Ok(input)
    },
  }
}

export const l = <T extends string | number | boolean | null | undefined>(value: T): Schema<T> => {
  return {
    parse(input) {
      if (input !== value) {
        return Err({
          entries: [
            {
              message: toErrorMessage(String(value), String(input), safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }
      return Ok(value)
    },
  }
}

export const arr = <T>(schema: Schema<T>): Schema<T[]> => {
  return {
    parse(input) {
      if (!Array.isArray(input)) {
        return Err({
          entries: [
            {
              message: toErrorMessage('array', typeof input, safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }

      const result: T[] = []
      const errors: ParseErrorEntry[] = []
      for (let i = 0; i < input.length; i++) {
        const value = input[i]
        const parsed = schema.parse(value)
        if (parsed.t === 'ok') {
          result.push(parsed.value)
          continue
        }
        errors.push(
          ...parsed.error.entries.map((err): ParseErrorEntry => {
            return {
              message: err.message,
              path: [String(i), ...err.path],
            }
          }),
        )
      }

      if (errors.length > 0) {
        return Err({ entries: errors })
      }

      return Ok(result)
    },
  }
}

export const maybe = <T>(schema: Schema<T>): Schema<T | null | undefined> => {
  return {
    parse(input) {
      if (input === null || input === undefined) {
        return Ok(null)
      }
      return schema.parse(input)
    },
  }
}

export const dict = <TKey extends string | number, TValue>(
  key: Schema<TKey>,
  value: Schema<TValue>,
): Schema<{ [key in TKey]: TValue }> => {
  return {
    parse(input) {
      if (!isIndexable(input)) {
        return Err({
          entries: [
            {
              message: toErrorMessage('object', typeof input, safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }

      const result = {} as Record<TKey, TValue>
      const entries: ParseErrorEntry[] = []
      for (const k in input) {
        const keyParsed = key.parse(k)
        if (keyParsed.t === 'err') {
          entries.push(
            ...keyParsed.error.entries.map((err): ParseErrorEntry => {
              return {
                message: err.message,
                path: [k, ...err.path],
              }
            }),
          )
          continue
        }

        const valueParsed = value.parse(input[k])
        if (valueParsed.t === 'err') {
          entries.push(
            ...valueParsed.error.entries.map((err): ParseErrorEntry => {
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

      if (entries.length > 0) {
        return Err({ entries })
      }

      return Ok(result)
    },
  }
}

export const partialDict = <TKey extends string | number, TValue>(
  key: Schema<TKey>,
  value: Schema<TValue>,
): Schema<Partial<{ [key in TKey]: TValue }>> => {
  return {
    parse(input) {
      if (!isIndexable(input)) {
        return Err({
          entries: [
            {
              message: toErrorMessage('object', typeof input, safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }

      const result = {} as Record<TKey, TValue>
      const entries: ParseErrorEntry[] = []
      for (const k in input) {
        const keyParsed = key.parse(k)
        if (keyParsed.t === 'err') {
          entries.push(
            ...keyParsed.error.entries.map((err): ParseErrorEntry => {
              return {
                message: err.message,
                path: [k, ...err.path],
              }
            }),
          )
          continue
        }

        const valueParsed = value.parse(input[k])
        if (valueParsed.t === 'err') {
          entries.push(
            ...valueParsed.error.entries.map((err): ParseErrorEntry => {
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

      if (entries.length > 0) {
        return Err({ entries })
      }

      return Ok(result)
    },
  }
}

export const custom = <T>(predicate: (input: unknown) => input is T, errorMessage: string): Schema<T> => {
  return {
    parse(input) {
      if (predicate(input)) {
        return Ok(input)
      }
      return Err({
        entries: [
          {
            message: `Custom validation failed. ${errorMessage}`,
            path: [],
          },
        ],
      })
    },
  }
}

export const unknown: Schema<unknown> = {
  parse(input) {
    return Ok(input)
  },
}

export const any: Schema<any> = {
  parse(input) {
    return Ok(input)
  },
}

export const enumeration = <T extends string | number | boolean | null | undefined>(
  values: T[] | readonly T[],
): Schema<T> => {
  return {
    parse(input) {
      if (!values.includes(input as T)) {
        return Err({
          entries: [
            {
              message: toErrorMessage(`one of ${values.join(', ')}`, String(input), safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }
      return Ok(input as T)
    },
  }
}

export const brand = <T, TBrand extends string | number | boolean | null | undefined>(
  schema: Schema<T>,
  _brand: TBrand,
): Schema<Brand<T, TBrand>> => {
  return {
    parse(input) {
      const parsed = schema.parse(input)
      switch (parsed.t) {
        case 'err':
          return parsed
        case 'ok':
          return Ok(parsed.value as Brand<T, TBrand>)
      }
    },
  }
}

export const regex = (regex: RegExp): Schema<string> => {
  return {
    parse(input) {
      if (typeof input !== 'string') {
        return Err({
          entries: [
            {
              message: toErrorMessage('string', typeof input, safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }

      if (!regex.test(input)) {
        return Err({
          entries: [
            {
              message: `Expected string to match regex: ${regex.source}`,
              path: [],
            },
          ],
        })
      }

      return Ok(input)
    },
  }
}

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export const json: Schema<Json> = {
  parse(input) {
    try {
      const serialized = safeJsonStringify(input)
      if (typeof serialized !== 'string') {
        return Err({
          entries: [
            {
              message: toErrorMessage('string', typeof input, safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }
      return Ok(input as Json)
    } catch (error) {
      return Err({
        entries: [
          {
            message: `Expected valid JSON. ${error}`,
            path: [],
          },
        ],
      })
    }
  },
}

export const bool: Schema<boolean> = {
  parse(input) {
    if (typeof input !== 'boolean') {
      return Err({
        entries: [
          {
            message: toErrorMessage('boolean', typeof input, safeJsonStringify(input)),
            path: [],
          },
        ],
      })
    }
    return Ok(input)
  },
}

export const partial = <T extends Record<string, unknown>>(schema: Schema<T>): Schema<Partial<T>> => {
  return {
    parse(input) {
      if (!isIndexable(input)) {
        return Err({
          entries: [
            {
              message: toErrorMessage('object', typeof input, safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }

      const result = {} as Partial<T>
      const errors: ParseErrorEntry[] = []

      for (const key in input) {
        if (!(key in (schema as any))) {
          continue
        }
        const value = input[key]
        const parsed = (schema as any)[key].parse(value)
        if (parsed.t === 'ok') {
          // @ts-ignore
          result[key] = parsed.value as T[keyof T]
        } else {
          errors.push(
            ...parsed.error.entries.map((err: ParseErrorEntry): ParseErrorEntry => {
              return {
                message: err.message,
                path: [key, ...err.path],
              }
            }),
          )
        }
      }

      if (errors.length > 0) {
        return Err({ entries: errors })
      }

      return Ok(result)
    },
  }
}
