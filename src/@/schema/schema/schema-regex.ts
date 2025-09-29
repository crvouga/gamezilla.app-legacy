import { Err, Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'
import { toErrorMessage, safeJsonStringify } from './shared-utils'

export type SchemaRegex = Schema<string> & {
  t: 'regex'
  regex: RegExp
}

export const isRegex = (input: unknown): input is SchemaRegex => {
  return isSchema(input) && input.t === 'regex'
}

export const regex = (regex: RegExp): SchemaRegex => {
  return {
    t: 'regex',
    regex,
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

      if (!regex.test(input)) {
        return Err({
          entries: [
            {
              message: `Expected string to match regex: ${regex.source}`,
              path: [],
            },
          ],
        })
      }

      return Ok(input)
    },
  }
}
