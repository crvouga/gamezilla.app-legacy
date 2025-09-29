import { Err, Ok } from '../../result/result'
import { ParseErrorEntry } from './parse-error-entry'
import { isSchema, type Schema } from './schema'
import { toErrorMessage, safeJsonStringify } from './shared-utils'

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
