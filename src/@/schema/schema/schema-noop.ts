import { Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'

export type SchemaNoop<T> = Schema<T> & {
  t: 'noop'
}

export const isNoop = (input: unknown): input is SchemaNoop<unknown> => {
  return isSchema(input) && input.t === 'noop'
}

export const noop = <T>(): SchemaNoop<T> => {
  return {
    t: 'noop',
    parse(input) {
      return Ok(input as T)
    },
  }
}
