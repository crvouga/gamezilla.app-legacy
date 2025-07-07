import { unwrap } from '~/@/result'
import { s } from '~/@/schema'

export type Codec<T> = {
  encode: (value: T) => string
  decode: (value: string) => T | null
}

const string: Codec<string> = {
  encode: (value) => value,
  decode: (value) => value,
}

const integer: Codec<number> = {
  encode: (value) => value.toString(),
  decode: (value) => parseInt(value),
}

const fromSchema = <T>(schema: s.Schema<T>): Codec<T> => {
  return {
    encode: (value) => {
      try {
        return JSON.stringify(unwrap(schema.parse(value)))
      } catch (error) {
        return ''
      }
    },
    decode: (value) => {
      try {
        return unwrap(schema.parse(JSON.parse(value)))
      } catch (error) {
        return null
      }
    },
  }
}

export const Codec = {
  string,
  integer,
  fromSchema,
}
