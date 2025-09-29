import { Ok } from '../../result/result'
import { isSchema, type Schema } from './schema'

export type SchemaAny = Schema<any> & {
  t: 'any'
}

export const isAny = (input: unknown): input is SchemaAny => {
  return isSchema(input) && input.t === 'any'
}

export const any: SchemaAny = {
  t: 'any',
  parse(input) {
    return Ok(input)
  },
}
