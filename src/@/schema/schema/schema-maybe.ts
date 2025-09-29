import { Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'

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
