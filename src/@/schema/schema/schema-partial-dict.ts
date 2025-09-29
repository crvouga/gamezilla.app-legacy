import { Err, Ok } from '../../result/result'
import { ParseErrorEntry } from './parse-error-entry'
import { isSchema, type Schema } from './schema'
import { toErrorMessage, safeJsonStringify, isIndexable } from './shared-utils'

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
