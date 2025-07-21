const IS_PROD = process.env.NODE_ENV?.includes('production') ?? false

export const assert = <T>(condition: T, message: string) => {
  if (!condition && !IS_PROD) {
    throw new Error(message)
  }
}

export const assertNotNullish = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) {
    throw new Error('Value is null or undefined')
  }
  return value
}
