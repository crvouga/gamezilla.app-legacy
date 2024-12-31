const IS_PRODUCTION = import.meta.env.NODE_ENV === 'production'

export const assert = <T>(condition: T, message: string) => {
  if (!condition && !IS_PRODUCTION) {
    throw new Error(message)
  }
}
