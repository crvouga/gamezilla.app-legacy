import { Err, Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'
import { toErrorMessage, safeJsonStringify } from './shared-utils'

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
