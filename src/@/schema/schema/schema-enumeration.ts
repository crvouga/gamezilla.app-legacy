import { Err, Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'
import { toErrorMessage, safeJsonStringify } from './shared-utils'

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
