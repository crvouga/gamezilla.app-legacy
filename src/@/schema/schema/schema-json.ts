import { Err, Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'
import { toErrorMessage, safeJsonStringify } from './shared-utils'

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type SchemaJson = Schema<Json> & {
  t: 'json'
}

export const isJson = (input: unknown): input is SchemaJson => {
  return isSchema(input) && input.t === 'json'
}

export const json: SchemaJson = {
  t: 'json',
  parse(input) {
    try {
      const serialized = safeJsonStringify(input)
      if (typeof serialized !== 'string') {
        return Err({
          entries: [
            {
              message: toErrorMessage('string', typeof input, safeJsonStringify(input)),
              path: [],
            },
          ],
        })
      }
      return Ok(input as Json)
    } catch (error) {
      return Err({
        entries: [
          {
            message: `Expected valid JSON. ${error}`,
            path: [],
          },
        ],
      })
    }
  },
}
