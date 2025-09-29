import { Err, Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'
import { toErrorMessage, safeJsonStringify } from './shared-utils'

export type SchemaBool = Schema<boolean> & {
  t: 'bool'
}

export const isBool = (input: unknown): input is SchemaBool => {
  return isSchema(input) && input.t === 'bool'
}

export const bool: SchemaBool = {
  t: 'bool',
  parse(input) {
    if (typeof input !== 'boolean') {
      return Err({
        entries: [
          {
            message: toErrorMessage('boolean', typeof input, safeJsonStringify(input)),
            path: [],
          },
        ],
      })
    }
    return Ok(input)
  },
}
