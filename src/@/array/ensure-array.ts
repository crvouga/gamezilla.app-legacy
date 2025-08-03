/**
 * Ensures a value is an array by wrapping non-array values in an array
 * @param arr The input value that may or may not be an array
 * @returns An array containing the input value if it wasn't already an array
 * @example
 * ensureArray('x') // ['x']
 * ensureArray(['x']) // ['x']
 * ensureArray([1, 2, 3]) // [1, 2, 3]
 */
export const ensureArray = <T>(arr: T | T[]): T[] => {
  if (Array.isArray(arr)) return arr
  return [arr]
}
