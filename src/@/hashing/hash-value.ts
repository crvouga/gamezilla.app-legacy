import { s } from '~/@/schema'

const schema = s.brand(s.str(), 'HashValue')

export type HashValue = s.Infer<typeof schema>

const fromString = (value: string): HashValue => {
  return value as HashValue
}

export const HashValue = {
  ...schema,
  fromString,
}
