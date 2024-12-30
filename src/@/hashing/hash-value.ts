import { p } from '~/@/parser'

const parser = p.brand(p.str, 'HashValue')

export type HashValue = p.Infer<typeof parser>

const fromString = (value: string): HashValue => {
  return value as HashValue
}

export const HashValue = {
  ...parser,
  fromString
}
