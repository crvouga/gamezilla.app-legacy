/**
 * Type guard that checks if a value is a non-null object
 * @param obj The value to check
 * @returns True if the value is a non-null object, false otherwise
 * @example
 * isObject({}) // true
 * isObject({ foo: 'bar' }) // true
 * isObject([]) // true
 * isObject(null) // false
 * isObject(undefined) // false
 * isObject('string') // false
 * isObject(123) // false
 */
export const isObject = (obj: unknown): obj is Record<string, unknown> => {
  return typeof obj === 'object' && obj !== null
}
