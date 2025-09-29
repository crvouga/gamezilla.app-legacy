import { Err, Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'

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
