import { Err, Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'
import { toErrorMessage, safeJsonStringify } from './shared-utils'

export type SchemaNum = Schema<number> & {
  t: 'num'
}

export const isNum = (input: unknown): input is SchemaNum => {
  return isSchema(input) && input.t === 'num'
}

export const num = (): SchemaNum => {
  return {
    t: 'num',
    parse(input) {
      if (typeof input !== 'number') {
        return Err({
          entries: [
            {
              message: toErrorMessage('number', typeof input, safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }
      return Ok(input)
    },
  }
}
