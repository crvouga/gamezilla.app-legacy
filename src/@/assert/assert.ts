const IS_PRODUCTION = import.meta.env?.NODE_ENV === 'production'

export const assert = <T>(condition: T, message: string) => {
  if (!condition && !IS_PRODUCTION) {
    throw new Error(message)
  }
}

export const assertNotNullish = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) {
    throw new Error('Value is null or undefined')
  }
  return value
}
