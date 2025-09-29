import { Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'

export type SchemaUnknown = Schema<unknown> & {
  t: 'unknown'
}

export const isUnknown = (input: unknown): input is SchemaUnknown => {
  return isSchema(input) && input.t === 'unknown'
}

export const unknown: SchemaUnknown = {
  t: 'unknown',
  parse(input) {
    return Ok(input)
  },
}
