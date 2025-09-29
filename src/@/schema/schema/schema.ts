import type { Brand } from '../../brand/brand'
import { Err, Ok } from '../../result/result'
import { ParseErrorEntry } from './parse-error-entry'
import { isSchema, type Schema } from './schema-types'

const toErrorMessage = (expected: string, actual: string, actualValue: string) => {
  return `Expected: ${expected}.\nActual Type: ${actual}.\nActual Value: ${actualValue}\n`
}

const safeJsonStringify = (_input: unknown): string => {
  return '[object]'
  // try {
  //   return JSON.stringify(input)
  // } catch (error) {
  //   return String(input)
  // }
}

export const is =
  <T>(schema: Schema<T>) =>
  (input: unknown): input is T => {
    return schema.parse(input).t === 'ok'
  }

export type SchemaNoop<T> = Schema<T> & {
  t: 'noop'
}

export const isNoop = (input: unknown): input is SchemaNoop<unknown> => {
  return isSchema(input) && input.t === 'noop'
}

export const noop = <T>(): SchemaNoop<T> => {
  return {
    t: 'noop',
    parse(input) {
      return Ok(input as T)
    },
  }
}

const isIndexable = (input: unknown): input is Record<string, unknown> => {
  return typeof input === 'object' && input !== null
}

export type SchemaObj<T> = Schema<T> & {
  t: 'obj'
  properties: {
    [K in keyof T]: Schema<T[K]>
  }
}

export const isObj = (input: unknown): input is SchemaObj<unknown> => {
  return isSchema(input) && input.t === 'obj'
}

export const obj = <T>(properties: SchemaObj<T>['properties']): SchemaObj<T> => {
  return {
    t: 'obj',
    properties,
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
      for (const key in properties) {
        const schema = properties[key]
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

export type SchemaPartialObj<T> = Schema<Partial<T>> & {
  t: 'partial-obj'
  properties: {
    [K in keyof T]: Schema<T[K]>
  }
}

export const isPartialObj = (input: unknown): input is SchemaPartialObj<unknown> => {
  return isSchema(input) && input.t === 'partial-obj'
}

export const partialObj = <T>(properties: SchemaPartialObj<T>['properties']): SchemaPartialObj<T> => {
  return {
    t: 'partial-obj',
    properties,
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

      for (const key in properties) {
        if (key in objInput) {
          const parsed = properties[key].parse(objInput[key])
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

export type SchemaStr = Schema<string> & {
  t: 'str'
}

export const isStr = (input: unknown): input is SchemaStr => {
  return isSchema(input) && input.t === 'str'
}

export const str = (): SchemaStr => {
  return {
    t: 'str',
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

export type SchemaNum = Schema<number> & {
  t: 'num'
}

export const isNum = (input: unknown): input is SchemaNum => {
  return isSchema(input) && input.t === 'num'
}

export const num = (): SchemaNum => {
  return {
    t: 'num',
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

export type SchemaLiteral<T extends string | number | boolean | null | undefined> = Schema<T> & {
  t: 'literal'
  value: T
}

export const isLiteral = <T extends string | number | boolean | null | undefined>(
  input: unknown,
): input is SchemaLiteral<T> => {
  return isSchema(input) && input.t === 'literal'
}

export const l = <T extends string | number | boolean | null | undefined>(value: T): SchemaLiteral<T> => {
  return {
    t: 'literal',
    value,
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

export type SchemaArr<T> = Schema<T[]> & {
  t: 'arr'
  element: Schema<T>
}

export const isArr = <T>(input: unknown): input is SchemaArr<T> => {
  return isSchema(input) && input.t === 'arr'
}

export const arr = <T>(element: Schema<T>): SchemaArr<T> => {
  return {
    t: 'arr',
    element,
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
        const parsed = element.parse(value)
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

export type SchemaMaybe<T> = Schema<T | null | undefined> & {
  t: 'maybe'
  schema: Schema<T>
}

export const isMaybe = <T>(input: unknown): input is SchemaMaybe<T> => {
  return isSchema(input) && input.t === 'maybe'
}

export const maybe = <T>(schema: Schema<T>): SchemaMaybe<T> => {
  return {
    t: 'maybe',
    schema,
    parse(input) {
      if (input === null || input === undefined) {
        return Ok(null)
      }
      return schema.parse(input)
    },
  }
}

export type SchemaDict<TKey extends string | number, TValue> = Schema<{ [key in TKey]: TValue }> & {
  t: 'dict'
  key: Schema<TKey>
  value: Schema<TValue>
}

export const isDict = <TKey extends string | number, TValue>(input: unknown): input is SchemaDict<TKey, TValue> => {
  return isSchema(input) && input.t === 'dict'
}

export const dict = <TKey extends string | number, TValue>(
  key: Schema<TKey>,
  value: Schema<TValue>,
): SchemaDict<TKey, TValue> => {
  return {
    t: 'dict',
    key,
    value,
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

export type SchemaPartialDict<TKey extends string | number, TValue> = Schema<Partial<{ [key in TKey]: TValue }>> & {
  t: 'partial-dict'
  key: Schema<TKey>
  value: Schema<TValue>
}

export const isPartialDict = <TKey extends string | number, TValue>(
  input: unknown,
): input is SchemaPartialDict<TKey, TValue> => {
  return isSchema(input) && input.t === 'partial-dict'
}

export const partialDict = <TKey extends string | number, TValue>(
  key: Schema<TKey>,
  value: Schema<TValue>,
): SchemaPartialDict<TKey, TValue> => {
  return {
    t: 'partial-dict',
    key,
    value,
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

export type SchemaCustom<T> = Schema<T> & {
  t: 'custom'
  predicate: (input: unknown) => input is T
  errorMessage: string
}

export const isCustom = <T>(input: unknown): input is SchemaCustom<T> => {
  return isSchema(input) && input.t === 'custom'
}

export const custom = <T>(predicate: (input: unknown) => input is T, errorMessage: string): SchemaCustom<T> => {
  return {
    t: 'custom',
    predicate,
    errorMessage,
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

export type SchemaUnknown = Schema<unknown> & {
  t: 'unknown'
}

export const isUnknown = (input: unknown): input is SchemaUnknown => {
  return isSchema(input) && input.t === 'unknown'
}

export const unknown: SchemaUnknown = {
  t: 'unknown',
  parse(input) {
    return Ok(input)
  },
}

export type SchemaAny = Schema<any> & {
  t: 'any'
}

export const isAny = (input: unknown): input is SchemaAny => {
  return isSchema(input) && input.t === 'any'
}

export const any: SchemaAny = {
  t: 'any',
  parse(input) {
    return Ok(input)
  },
}

export type SchemaEnumeration<T extends string | number | boolean | null | undefined> = Schema<T> & {
  t: 'enumeration'
  values: T[] | readonly T[]
}

export const isEnumeration = <T extends string | number | boolean | null | undefined>(
  input: unknown,
): input is SchemaEnumeration<T> => {
  return isSchema(input) && input.t === 'enumeration'
}

export const enumeration = <T extends string | number | boolean | null | undefined>(
  values: T[] | readonly T[],
): SchemaEnumeration<T> => {
  return {
    t: 'enumeration',
    values,
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

export type SchemaBrand<T, TBrand extends string | number | boolean | null | undefined> = Schema<Brand<T, TBrand>> & {
  t: 'brand'
  schema: Schema<T>
  brand: TBrand
}

export const isBrand = <T, TBrand extends string | number | boolean | null | undefined>(
  input: unknown,
): input is SchemaBrand<T, TBrand> => {
  return isSchema(input) && input.t === 'brand'
}

export const brand = <T, TBrand extends string | number | boolean | null | undefined>(
  schema: Schema<T>,
  _brand: TBrand,
): SchemaBrand<T, TBrand> => {
  return {
    t: 'brand',
    schema,
    brand: _brand,
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

export type SchemaRegex = Schema<string> & {
  t: 'regex'
  regex: RegExp
}

export const isRegex = (input: unknown): input is SchemaRegex => {
  return isSchema(input) && input.t === 'regex'
}

export const regex = (regex: RegExp): SchemaRegex => {
  return {
    t: 'regex',
    regex,
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

export type SchemaJson = Schema<Json> & {
  t: 'json'
}

export const isJson = (input: unknown): input is SchemaJson => {
  return isSchema(input) && input.t === 'json'
}

export const json: SchemaJson = {
  t: 'json',
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

export type SchemaBool = Schema<boolean> & {
  t: 'bool'
}

export const isBool = (input: unknown): input is SchemaBool => {
  return isSchema(input) && input.t === 'bool'
}

export const bool: SchemaBool = {
  t: 'bool',
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

export type SchemaPartial<T extends Record<string, unknown>> = Schema<Partial<T>> & {
  t: 'partial'
  schema: Schema<T>
}

export const isPartial = <T extends Record<string, unknown>>(input: unknown): input is SchemaPartial<T> => {
  return isSchema(input) && input.t === 'partial'
}

export const partial = <T extends Record<string, unknown>>(schema: Schema<T>): SchemaPartial<T> => {
  return {
    t: 'partial',
    schema,
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

export type SchemaKeyOf<T extends Record<string, unknown>> = Schema<keyof T> & {
  t: 'key-of'
  schema: Schema<T>
}

export const isKeyOf = <T extends Record<string, unknown>>(input: unknown): input is SchemaKeyOf<T> => {
  return isSchema(input) && input.t === 'key-of'
}

export const keyOf = <T extends Record<string, unknown>>(schema: Schema<T>): SchemaKeyOf<T> => {
  return {
    t: 'key-of',
    schema,
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
      if (!(input in schema)) {
        return Err({
          entries: [
            {
              message: toErrorMessage(
                `Expected one of ${Object.keys(schema).join(', ')}`,
                input,
                safeJsonStringify(input),
              ),
              path: [],
            },
          ],
        })
      }

      return Ok(input as keyof T)
    },
  }
}
