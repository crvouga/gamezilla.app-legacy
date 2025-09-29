import { Err, Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'
import { toErrorMessage, safeJsonStringify } from './shared-utils'

export type SchemaStr = Schema<string> & {
  t: 'str'
}

export const isStr = (input: unknown): input is SchemaStr => {
  return isSchema(input) && input.t === 'str'
}

export const str = (): SchemaStr => {
  return {
    t: 'str',
    parse(input) {
      if (typeof input !== 'string') {
        return Err({
          entries: [
            {
              message: toErrorMessage('string', typeof input, `${input instanceof Date}, ${safeJsonStringify(input)}`),
              path: [],
            },
          ],
        })
      }
      return Ok(input)
    },
  }
}
