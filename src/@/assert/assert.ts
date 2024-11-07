const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const assert = <T>(condition: T, message: string) => {
  if (!condition && !IS_PRODUCTION) {
    throw new Error(message)
  }
}
