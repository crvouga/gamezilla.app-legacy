import { Err, Ok } from '../../result/result'
import { ParseErrorEntry } from './parse-error-entry'
import { isSchema, type Schema } from './schema'
import { toErrorMessage, safeJsonStringify, isIndexable } from './shared-utils'

export type SchemaObj<T> = Schema<T> & {
  t: 'obj'
  properties: {
    [K in keyof T]: Schema<T[K]>
  }
}

export const isObj = <T>(input: unknown): input is SchemaObj<T> => {
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
