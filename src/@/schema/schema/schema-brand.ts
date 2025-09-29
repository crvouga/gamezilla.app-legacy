import { Ok } from '../../result/result'
import type { Brand } from '../../brand/brand'
import { isSchema, type Schema } from './schema'

export type SchemaBrand<T, TBrand extends string | number | boolean | null | undefined> = Schema<Brand<T, TBrand>> & {
  t: 'brand'
  schema: Schema<T>
  brand: TBrand
}

export const isBrand = <T, TBrand extends string | number | boolean | null | undefined>(
  input: unknown,
): input is SchemaBrand<T, TBrand> => {
  return isSchema(input) && input.t === 'brand'
}

export const brand = <T, TBrand extends string | number | boolean | null | undefined>(
  schema: Schema<T>,
  _brand: TBrand,
): SchemaBrand<T, TBrand> => {
  return {
    t: 'brand',
    schema,
    brand: _brand,
    parse(input) {
      const parsed = schema.parse(input)
      switch (parsed.t) {
        case 'err':
          return parsed
        case 'ok':
          return Ok(parsed.value as Brand<T, TBrand>)
      }
    },
  }
}
