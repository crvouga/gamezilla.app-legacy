import { Err, Ok } from '../../result/result'
import { ParseErrorEntry } from './parse-error-entry'
import { isSchema, type Schema } from './schema'

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
