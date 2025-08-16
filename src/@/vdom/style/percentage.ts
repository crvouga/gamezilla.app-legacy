export type Percentage = `${number}%` | `-${number}%`

const REGEX = /^\d+%$/

const is = (value: unknown): value is Percentage => {
  return typeof value === 'string' && REGEX.test(value)
}

export const Percentage = {
  is,
}
