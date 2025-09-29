import { Err, Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'
import { toErrorMessage, safeJsonStringify } from './shared-utils'

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
