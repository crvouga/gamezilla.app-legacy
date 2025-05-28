import { s } from '~/@/schema'

const parser = s.brand(s.str, 'HashValue')

export type HashValue = s.Infer<typeof parser>

const fromString = (value: string): HashValue => {
  return value as HashValue
}

export const HashValue = {
  ...parser,
  fromString,
}
