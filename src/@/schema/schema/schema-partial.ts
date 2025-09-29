import { Err, Ok } from '../../result/result'
import { ParseErrorEntry } from './parse-error-entry'
import { isSchema, type Schema } from './schema'
import { toErrorMessage, safeJsonStringify, isIndexable } from './shared-utils'

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
